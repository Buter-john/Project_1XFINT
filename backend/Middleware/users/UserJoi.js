import Joi from "joi";

export function validateLogin(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    let message;
    switch (error.details[0].context.key) {
      case "email":
        if (error.details[0].type === "string.empty") {
          message = "Email nécessaire";
        } else if (error.details[0].type === "string.email") {
          message = "Mot de passe où Email incorrect";
        }
        break;
      case "password":
        if (error.details[0].type === "string.empty") {
          message = "Mot de passe nécessaire";
        } else {
          message = "Mot de passe où Email incorrect";
        }
        break;
      default:
        message = "Données incorrectes";
        break;
    }
    return { message: message, statut: false, code: 400 };
  }
  return { message: "correct form", statut: true, code: 200 };
}

export function validateRegister(data) {
  const schema = Joi.object({
    email: Joi.string().email().pattern(/@supherman\.com$/).required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("EMPLOYE", "MANAGER", "COMPTABILITE").required().messages({
      "any.only": "Le rôle est invalide",
      "string.empty": "Le rôle est requis"
    }),
  });

  const { error } = schema.validate(data);
  if (error) {
    let message;
    switch (error.details[0].context.key) {
      case "email":
        if (error.details[0].type === "string.empty") {
          message = "Email nécessaire";
        } else if (error.details[0].type === "string.email") {
          message = "Email incorrect";
        } else if (error.details[0].type === "string.pattern.base") {
          message = "L'email doit se terminer par @supherman.com";
        }
        break;
      case "password":
        if (error.details[0].type === "string.empty") {
          message = "Mot de passe nécessaire";
        } else if (error.details[0].type === "string.min") {
          message = "Mot de passe doit contenir au moins 8 caractères";
        }
    }
    return { message: message, statut: false, code: 400 };
  }
  return { message: "correct form", statut: true, code: 200 };
}

export function valideFraisNote(data) {
  const schema = Joi.object({
    titre: Joi.string().required().messages({
      "string.empty": "Le titre est requis",
    }),
    commentaire: Joi.string().required().messages({
      "string.empty": "Le commentaire est requis",
    }),
    fichiers: Joi.string().optional()
  });

  const { error } = schema.validate(data);
  if (error) {
    return {
      statut: false,
      code: 400,
      message: error.details[0].message,
    };
  }

  return {
    statut: true,
    code: 200,
    message: "Formulaire valide",
  };
}