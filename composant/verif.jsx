import { object, string } from "yup";

const validateschem = object().shape({
  email: string().matches(
    /@gmail.com/,
    "l'adresse email doit être sous ce forma (exp@gmail.com) ")
    .required(
      "Veuillez renseigner l'email'"
    )
  ,
  password: string()
    .required("veuillez renseigner votre mot de passe")
    .min(8, "Le mot de passe doit avoir au moins 8 caractères")
    .matches(
      /[A-Z]/,
      "Votre mot de passe doit contenir au moins une majuscule"
      
    ),
});
export default validateschem;
