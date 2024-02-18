import React, { useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import Error from "../Form/Error";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { DotLoader } from "react-spinners";
import { type AuthResponse, api, Method } from "@/services/api";
import useTheme from "@/hooks/useTheme";

function Popup({
  showPopup,
  setShowPopup,
}: {
  showPopup: boolean;
  setShowPopup: React.Dispatch<boolean>;
}) {
  const { auth } = useUser();
  const [signUp, setSignUp] = useState<boolean>(false);
  const [signIn, setSignIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [credentials, setCredentials] = useState({
    nickname: "",
    password: "",
    email: "",
  });
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasError(false);
    setIsSubmitting(true);

    try {
      let endpoint = signUp ? "sign-up" : signIn ? "sign-in" : "tmp";

      const res = await api(`/auth/${endpoint}`, Method.POST, credentials);

      if (res.status === 200 || res.status === 201) {
        const data: AuthResponse = await res.json();
        auth(data);
        router.push("/chat");
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      } else {
        setHasError(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      setHasError(true);
    }
  };

  const isNotTemp = signUp || signIn;

  return (
    <div
      className="flex absolute top-0 left-0 z-20 flex-col justify-center items-center px-6 py-8 mx-auto w-full h-screen backdrop-blur-sm lg:py-0"
      
          
      
      onClick={() => setShowPopup(true)}
    >
      <div
        className={`relative w-full  rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0 ${theme === "light" ? "bg-[#331D2C]" : "bg-[#EFE1D1]"
      }`}
        onClick={(e) => e.stopPropagation()}
      >
        <AiFillCloseCircle
          size={30}
          className="absolute -top-2 -right-2 cursor-pointer text-primary"
          onClick={() => setShowPopup(false)}
        />
        <div className="p-2 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight leading-tight text-primary md:text-2xl">
            {signUp ? "Créer mon compte" : "Rejoindre un chat"}
          </h1>
          {hasError && <Error message="Une erreur est survenue" />}
          <form
            className="flex flex-col space-y-4 md:space-y-6"
            onSubmit={handleSubmit}
          >
            {!signIn && (
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-primary required"
                >
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Nom d'utilisateur"
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      nickname: e.target.value,
                    });
                  }}
                  className="w-full p-3 border border-gray-300 text-secondary rounded-md"
                />
              </div>
            )}
            {isNotTemp && (
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-primary required"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Email"
                  onChange={(e) => {
                    setCredentials({ ...credentials, email: e.target.value });
                  }}
                  className="w-full p-3 border border-gray-300 text-secondary rounded-md"
                />
              </div>
            )}
            {isNotTemp && (
              <div>
                <label
                  htmlFor="title"
                  className={`block mb - 2 text - sm font - medium text-primary ${
                    isNotTemp ? "required" : ""
                  }`}
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="title"
                  name="title"
                  required={isNotTemp}
                  placeholder="Mot de passe"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    });
                  }}
                  className="w-full p-3 border border-gray-300 text-secondary rounded-md"
                />
              </div>
            )}
            <div>
              <a
                className="text-sm font-medium text-primary cursor-pointer"
                onClick={() => {
                  setSignUp(true);
                  setSignIn(false);
                  setHasError(false);
                }}
              >
                Créer un compte
              </a>
              &nbsp;/&nbsp;
              <a
                className="text-sm font-medium text-primary cursor-pointer"
                onClick={() => {
                  setSignUp(false);
                  setHasError(false);
                  setSignIn(true);
                }}
              >
                Connexion
              </a>
            </div>
            {isSubmitting ? (
              <DotLoader color="#A78295" className="mx-auto" size={20} />
            ) : (
              <button
                type="submit"
                className="w-full py-3 text-white bg-primary rounded-md"
              >
                Rejoindre
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Popup;
