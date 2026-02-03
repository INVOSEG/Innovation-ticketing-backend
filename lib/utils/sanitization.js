const Joi = require("joi");
const { EChatStatus, EPaymentTypeStatus } = require("./enum");

exports.userResgisterSchemaValidator = Joi.object({
  firstName: Joi.string().required(),
  role: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(4),
  phone: Joi.string().required().min(11),
});

exports.userLoginSchemaValidator = Joi.object({
  email: Joi.string().email().required(),
  agentCode: Joi.string().required(),
  password: Joi.string().required().min(4),
});

exports.updateProfileSchemaValidator = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  phone: Joi.string().required().min(11),
});

exports.updatePasswordSchemaValidator = Joi.object({
  oldpassword: Joi.string().required().min(4),
  newpassword: Joi.string().required().min(4),
});

exports.createPaymentTypeSchemaValidator = Joi.object({
  name: Joi.string().required().min(4),
});
exports.UpadatePaymentTypeSchemaValidator = Joi.object({
  name: Joi.string().optional(),
  status: Joi.string()
    .valid(EChatStatus.ACTIVE, EChatStatus.INACTIVE)
    .optional(),
});

exports.paymentValidator = Joi.object({
  amount: Joi.number().required(),
  title: Joi.string().required(),
  // user: Joi.string().hex().length(24).required(), // ObjectId validation
  paymentType: Joi.string().required(), // ObjectId validation
  images: Joi.array().items(Joi.string().uri()), // Array of image URLs
  description: Joi.string().required(),
  paymentDate: Joi.date().required(),
  deadLine: Joi.date().required(),
  assignedTo: Joi.string().required(),
  paidBy: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(EPaymentTypeStatus))
    .default(EPaymentTypeStatus.pending),
});
