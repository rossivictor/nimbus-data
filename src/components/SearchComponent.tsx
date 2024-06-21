"use client"

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GiMagicBroom } from "react-icons/gi";
import { IconContext } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";
import { VscError } from "react-icons/vsc";
import Image from "next/image";

interface ErrorWithResponse {
  response?: {
    status: number;
  };
  code?: string;
  message: string;
}

const SearchComponent = () => {
  const [url, setUrl] = useState("");

  const [phones, setPhones] = useState<string[]>([]);
  const [whatsAppLinks, setWhatsAppLinks] = useState<{ link: string }[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState<{
    [key: string]: string[];
  }>({});
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [timerId, setTimerId] = useState <number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  useEffect(() => {
    const currentRef = copyButtonRef.current;

    const handleClick = () => {
      const contentToCopy = [
        companyName,
        ...phones,
        ...whatsAppLinks.map((linkObj) => linkObj.link),
        ...emails,
        ...Object.values(socialMediaLinks)
          .flat()
          .map((link) => link),
      ].join("\n");

      navigator.clipboard.writeText(contentToCopy);
    };

    if (currentRef) {
      currentRef.addEventListener("click", handleClick);
    }

    // Função de limpeza
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("click", handleClick);
      }
    };
  }, [companyName, phones, whatsAppLinks, emails, socialMediaLinks]);

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);


  const handleSearch = async () => {
    // Limpa a mensagem de erro anterior
    setErrorMessage("");

    // Verifica se a URL foi inserida
    if (!url || !isValidUrl(url)) {
      setErrorMessage("Por favor, insira uma URL válida.");
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3004/api";

    // Se a URL é válida, faz a busca...
    setLoading(true);
    try {
      const response = await axios.post(
        apiUrl + "/scrape",
        {
          url,
        },
        {
          timeout: 60000,
        }
      );

      // Verifica se a resposta está ok
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`A URL retornou um erro: ${response.status}`);
      }

      // Verifica se a resposta tem dados
      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error("A URL não retornou dados.");
      }

      console.log('response.data:', response.data)

      // Processa os dados...
      const uniquePhones: string[] = Array.from(new Set(response.data.phones || []));

      let uniqueWhatsAppLinks: { link: string; phone: string }[] = [];
      let seenPhones: { [key: string]: boolean } = {};

      if (response.data.whatsAppLinks) {
        response.data.whatsAppLinks.forEach(
          (item: { link: string; phone: string }) => {
            if (!seenPhones[item.phone]) {
              uniqueWhatsAppLinks.push(item);
              seenPhones[item.phone] = true;
            }
          }
        );
      }

      console.log('uniqueWhatsAppLinks:', uniqueWhatsAppLinks)

      const uniqueEmails: string[] = Array.from(new Set(response.data.emails || []));

      let uniqueSocialMediaLinks: { [key: string]: string[] } = {};
      if (response.data.socialMedia) {
        uniqueSocialMediaLinks = Object.keys(response.data.socialMedia).reduce(
          (unique: { [key: string]: string[] }, key: string) => {

            unique[key] = Array.from(
              new Set(response.data.socialMedia[key] || [])
            );
            return unique;
          },
          {}
        );
      }

      // company name
      setCompanyName(response.data.title);

      setPhones(uniquePhones);
      setWhatsAppLinks(uniqueWhatsAppLinks);
      setEmails(uniqueEmails);
      setSocialMediaLinks(uniqueSocialMediaLinks);

    } catch (error: unknown) {
      const err = error as ErrorWithResponse;
      if (err.response && err.response.status === 500) {
        setErrorMessage(
          "A URL é inválida ou está fora do ar. Por favor, tente novamente."
        );
      } else if (err.code === "ECONNABORTED") {
        setErrorMessage(
          "A requisição excedeu o tempo limite. Por favor, tente novamente."
        );
      } else {
        setErrorMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (event: { key: string; }) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <div className="flex flex-row bg-black/10 px-4 py-2 rounded-full w-4/5 mx-auto my-10 dark:bg-white/10">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Insira a URL da página de onde deseja capturar os dados"
          className="w-full p-2 bg-transparent outline-none dark:text-white dark:placeholder-white"
          onKeyDown={handleKeyPress}
        />
        <IconContext.Provider value={{ color: "#f87171", size: "2em" }}>
          <button className="bg-transparent" onClick={handleSearch}>
            <GiMagicBroom />
          </button>
        </IconContext.Provider>
      </div>
      {loading && (
        <div className="absolute left-0 top-0 w-full h-full bg-blue-950/90 flex items-center">
          <div className="flex-col mx-auto">
            <Image
              src="/loader.webp"
              className="mx-auto rounded-3xl mb-10"
              alt="Loading..."
              width={500}
              height={500}
            />
            <p className="text-white font-bold text-3xl leading-10 mx-auto w-2/3 mb-4">
              Por favor, aguarde!
            </p>
            <p className="text-white/70 leading-normal mx-auto w-full mb-4">
              Estamos voando com a Nimbus atrás das informações que você
              precisa...
            </p>
            <p className="text-white/70 leading-normal mx-auto w-full">
              Normalmente, isso leva apenas alguns segundos!
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="flex flex-row items-center w-fit mx-auto px-5 py-3 rounded-full bg-red-500/30 text-red-900/80 dark:text-white border border-red-800/70 -mt-8">
          <IconContext.Provider value={{ className: "me-2" }}>
            <VscError />
          </IconContext.Provider>
          {errorMessage}
        </p>
      )}

      {companyName && <h2 className="mt-12 mb-8">{companyName}</h2>}

      <div className="flex flex-row justify-evenly flex-wrap gap-8">
        {phones.length > 0 && (
          <div className="bg-red-100/50 border-red-400/50 border p-6 rounded-2xl dark:bg-white/10">
            <h3 className="mb-3">Telefones</h3>
            <ul>
              {phones.map((phone, index) => (
                <li key={index}>
                  <a href={`tel:${phone}`}>{phone}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {whatsAppLinks.length > 0 && (
          <div className="flex flex-col items-center bg-red-100/50 border-red-400/50 border p-6 rounded-2xl dark:bg-white/10">
            <h3 className="mb-3">WhatsApp</h3>
            {whatsAppLinks.map((linkObj, index) => (
              <a
                href={linkObj.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="relative"
              >
                <IconContext.Provider
                  value={{ color: "#25D366", size: "2.25em" }}
                >
                  <FaWhatsapp />
                </IconContext.Provider>
                {whatsAppLinks.length > 1 && (
                  <span className="absolute -bottom-2 -right-2 h-5 w-5 pt-1 bg-green-900 text-white block text-xs rounded-full">
                    {index + 1}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        {emails.length > 0 && (
          <div className="bg-red-100/50 border-red-400/50 border p-6 rounded-2xl dark:bg-white/10">
            <h3 className="mb-3">E-mails</h3>
            <ul>
              {emails.map((email, index) => (
                <li key={index}>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Object.values(socialMediaLinks).some((links) => links.length > 0) && (
          <div className="bg-red-100/50 border-red-400/50 border p-6 rounded-2xl dark:bg-white/10">
            <h3 className="mb-3">Redes sociais</h3>

            <div className="flex flex-row justify-around gap-4">
              {Object.keys(socialMediaLinks).map((key) => {
                const links = socialMediaLinks[key];
                return (
                  links.length > 0 &&
                  links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <IconContext.Provider
                        value={{ color: "#1877F2", size: "1.6em" }}
                      >
                        {key === "facebook" && <FaFacebook />}
                      </IconContext.Provider>
                      <IconContext.Provider
                        value={{ color: "#E4405F", size: "1.6em" }}
                      >
                        {key === "instagram" && <FaInstagram />}
                      </IconContext.Provider>
                      <IconContext.Provider
                        value={{ color: "#0c65d1", size: "1.6em" }}
                      >
                        {key === "linkedin" && <FaLinkedin />}
                      </IconContext.Provider>
                      <IconContext.Provider
                        value={{ color: "#FF0000", size: "1.6em" }}
                      >
                        {key === "youtube" && <FaYoutube />}
                      </IconContext.Provider>
                      <IconContext.Provider
                        value={{ color: "#424242", size: "1.6em" }}
                      >
                        {key === "twitter" && <FaXTwitter />}
                        {key === "x" && <FaXTwitter />}
                      </IconContext.Provider>
                    </a>
                  ))
                );
              })}
            </div>
          </div>
        )}
      </div>
      {companyName && (
        <>
          <button
            className="mt-8"
            ref={copyButtonRef}
            onClick={() => {
              setCopyMessage("Copied to clipboard!");
              if (timerId !== null) {
                clearTimeout(timerId);
              }
              setTimerId(window.setTimeout(() => setCopyMessage(""), 5000));
            }}
          >
            Copiar tudo
          </button>
          {copyMessage && (
            <p className="bg-green-100/50 border-green-400/50 text-xs mt-4 border border-dashed p-3 px-6 w-fit mx-auto rounded-xl">
              {copyMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchComponent;
