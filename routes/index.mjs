import Joi from "joi";
import Boom from "@hapi/boom";
import { Authority, PrivateKey, PublicKey } from "@hiveio/dhive";
import { hiveClient, isSignedWithActiveKey } from "../utils.mjs";
import { ACCOUNT, SIGNING_PRIVATE_KEY } from "../config.mjs";

const isPubKey = (value, helpers) => {
  let pubKey = value;
  try {
    pubKey = PublicKey.fromString(value);
  } catch {
    return helpers.error("any.invalid");
  }

  return pubKey;
};

const isJson = (value, helpers) => {
  let json = value;

  try {
    json = JSON.parse(value);
  } catch {
    return helpers.error("any.invalid");
  }

  return json;
};

const validateSignature = async (value, helpers) => {
  const {
    context: { payload },
    coreConfig,
  } = helpers.prefs;

  const validSignature = await isSignedWithActiveKey(
    coreConfig.signingPublicKey,
    payload,
    value
  );

  if (!validSignature) {
    const error = new Joi.ValidationError("Invalid signature in the header", [
      {
        path: ["x-signature"],
        context: {
          key: "x-signature",
          label: "signature",
          value,
        },
      },
    ]);

    throw Boom.boomify(error, { statusCode: 400 });
  }
};

export default [
  {
    method: "POST",
    path: "/",
    options(server) {
      return {
        validate: {
          headers: Joi.object({
            "x-signature": Joi.string().required().external(validateSignature),
          }).options({ allowUnknown: true }),
          payload: Joi.object({
            account: Joi.string().min(3).max(16).required(),
            owner: Joi.string().custom(isPubKey).required().messages({
              "any.invalid": "Provided owner key is not a valid public key.",
            }),
            active: Joi.string().custom(isPubKey).required().messages({
              "any.invalid": "Provided active key is not a valid public key.",
            }),
            posting: Joi.string().custom(isPubKey).required().messages({
              "any.invalid": "Provided posting key is not a valid public key.",
            }),
            memo: Joi.string().custom(isPubKey).required().messages({
              "any.invalid": "Provided memo key is not a valid public key.",
            }),
            metadata: Joi.string().custom(isJson).default({}).messages({
              "any.invalid": "Provided metadata is not valid JSON.",
            }),
          }).options({ stripUnknown: true }),
          options: {
            coreConfig: server.settings.app,
          },
        },
      };
    },
    async handler(request) {
      try {
        const { account, owner, active, posting, memo, metadata } =
          request.payload;

        const [exists] = await hiveClient.database.getAccounts([account]);

        if (exists) {
          return Boom.badData(`Hive account @${account} already exists.`);
        }

        const ops = [
          [
            "create_claimed_account",
            {
              creator: ACCOUNT,
              new_account_name: account,
              owner: Authority.from(owner),
              active: Authority.from(active),
              posting: Authority.from(posting),
              memo_key: memo,
              json_metadata: JSON.stringify(metadata),
              extensions: [],
            },
          ],
        ];

        const confirmation = await hiveClient.broadcast.sendOperations(
          ops,
          PrivateKey.from(SIGNING_PRIVATE_KEY)
        );

        return confirmation;
      } catch (e) {
        console.log(e);
      }

      return Boom.badData();
    },
  },
];
