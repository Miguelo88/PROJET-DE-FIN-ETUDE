import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Sparkles,
  Plane,
  ChevronDown,
  Mic,
  MicOff,
} from "lucide-react";
import { parseFlightQuery, generateBotResponse } from "../../utils/aiParser";

const SUGGESTIONS = [
  "Paris → Tokyo le 10 septembre",
  "Aller-retour New York, 2 adultes",
  "Vol business pour Dubaï demain",
  "Barcelone le 15 août, famille",
];

const GREETING = {
  id: 0,
  role: "bot",
  text: 'Bonjour ! ✈️ Je suis votre assistant voyage.\n\nDites-moi où vous souhaitez aller et je remplirai le formulaire pour vous.\n\nEssayez par exemple :\n*"Je veux un vol Paris-Tokyo le 10 septembre pour 2 adultes"*',
};

function renderText(text) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const segments = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={li}>
        {segments.map((seg, si) => {
          if (seg.startsWith("**") && seg.endsWith("**")) {
            return <strong key={si}>{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith("*") && seg.endsWith("*")) {
            return (
              <em key={si} className="text-blue-300">
                {seg.slice(1, -1)}
              </em>
            );
          }
          return <span key={si}>{seg}</span>;
        })}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unread, setUnread] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(1);
  const recognitionRef = useRef(null);
  const inputValueRef = useRef("");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const applyParsed = useCallback((parsed, query) => {
    window.dispatchEvent(
      new CustomEvent("flight-ai-from-chat", {
        detail: { parsed, query },
      }),
    );
  }, []);

  const launchAutoSearch = useCallback((parsed) => {
    if (!parsed?.origin || !parsed?.destination || !parsed?.departDate) {
      return false;
    }

    const adults = parsed.adults ?? 1;
    const children = parsed.children ?? 0;
    const totalPassengers = adults + children;
    const tripType = parsed.tripType || "round-trip";
    const params = new URLSearchParams({
      origin: parsed.origin,
      destination: parsed.destination,
      date: parsed.departDate,
      passengers: String(totalPassengers),
      tripType,
    });

    if (parsed.returnDate) {
      params.set("returnDate", parsed.returnDate);
    }

    const nextUrl = `/results?${params.toString()}`;
    window.history.pushState({}, "", nextUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return true;
  }, []);

  const handleSend = useCallback(
    (text) => {
      const query = (text ?? inputValueRef.current).trim();
      if (!query) return;

      const userMsg = { id: nextId.current++, role: "user", text: query };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      inputValueRef.current = "";
      setShowSuggestions(false);
      setIsTyping(true);

      setTimeout(
        () => {
          const parsed = parseFlightQuery(query);
          const hasData =
            parsed.origin ||
            parsed.destination ||
            parsed.departDate ||
            parsed.adults ||
            parsed.children ||
            parsed.tripType;

          if (hasData) {
            applyParsed(parsed, query);
          }

          const shouldAutoSearch = launchAutoSearch(parsed);
          const responseText = shouldAutoSearch
            ? "✅ J’ai assez d’informations pour lancer la recherche automatiquement."
            : generateBotResponse(parsed);

          const botText = shouldAutoSearch
            ? `${responseText}\n\n${generateBotResponse(parsed)}`
            : responseText;
          const botMsg = {
            id: nextId.current++,
            role: "bot",
            text: botText,
            parsed,
          };

          setIsTyping(false);
          setMessages((prev) => [...prev, botMsg]);

          if (!open) setUnread((n) => n + 1);
        },
        700 + Math.random() * 400,
      );
    },
    [applyParsed, launchAutoSearch, open],
  );

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        handleSend(transcript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [handleSend]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleMicClick() {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    recognitionRef.current?.start();
  }

  return (
    <>
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] transition-all duration-300 origin-bottom-right ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <div
          className="flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          style={{ height: "540px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Assistant IA</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  En ligne · Rempli le formulaire
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Plane className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[260px] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Plane className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center h-4">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && messages.length <= 1 && (
              <div className="pt-1">
                <p className="text-xs text-gray-400 mb-2 text-center">
                  Suggestions rapides
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  inputValueRef.current = e.target.value;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Décrivez votre voyage..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400 max-h-24"
                style={{ lineHeight: "1.5" }}
              />

              <button
                type="button"
                onClick={handleMicClick}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label="Parler"
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Appuyez sur Entrée pour envoyer · Shift+Entrée pour une nouvelle
              ligne
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
        }}
        aria-label="Ouvrir l'assistant IA"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}

        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20" />
        )}

        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}

// import { useState, useRef, useEffect } from "react";
// import { X, Send, Sparkles, Plane, ChevronDown } from "lucide-react";
// import { parseFlightQuery, generateBotResponse } from "../../utils/aiParser";

// const SUGGESTIONS = [
//   "Paris → Tokyo le 10 septembre",
//   "Aller-retour New York, 2 adultes",
//   "Vol business pour Dubaï demain",
//   "Barcelone le 15 août, famille",
// ];

// const GREETING = {
//   id: 0,
//   role: "bot",
//   text: "Bonjour ! ✈️ Je suis votre assistant voyage.\n\nDites-moi où vous souhaitez aller et je remplirai le formulaire pour vous.\n\nEssayez par exemple :\n*\"Je veux un vol Paris-Tokyo le 10 septembre pour 2 adultes\"*",
// };

// function renderText(text) {
//   const lines = text.split("\n");
//   return lines.map((line, li) => {
//     const segments = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
//     return (
//       <span key={li}>
//         {segments.map((seg, si) => {
//           if (seg.startsWith("**") && seg.endsWith("**")) {
//             return <strong key={si}>{seg.slice(2, -2)}</strong>;
//           }
//           if (seg.startsWith("*") && seg.endsWith("*")) {
//             return (
//               <em key={si} className="text-blue-300">
//                 {seg.slice(1, -1)}
//               </em>
//             );
//           }
//           return <span key={si}>{seg}</span>;
//         })}
//         {li < lines.length - 1 && <br />}
//       </span>
//     );
//   });
// }

// export function ChatBot() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([GREETING]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(true);
//   const [unread, setUnread] = useState(0);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const nextId = useRef(1);

//   useEffect(() => {
//     if (open) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setUnread(0);
//       setTimeout(() => inputRef.current?.focus(), 100);
//     }
//   }, [open]);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isTyping]);

//   function applyParsed(parsed) {
//     window.dispatchEvent(
//       new CustomEvent("flight-ai-from-chat", { detail: parsed })
//     );
//   }

//   function handleSend(text) {
//     const query = (text ?? input).trim();
//     if (!query) return;

//     const userMsg = { id: nextId.current++, role: "user", text: query };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setShowSuggestions(false);
//     setIsTyping(true);

//     setTimeout(() => {
//       const parsed = parseFlightQuery(query);
//       const hasData =
//         parsed.origin || parsed.destination || parsed.departDate || parsed.adults;

//       if (hasData) applyParsed(parsed);

//       const botText = generateBotResponse(parsed);
//       const botMsg = {
//         id: nextId.current++,
//         role: "bot",
//         text: botText,
//         parsed,
//       };

//       setIsTyping(false);
//       setMessages((prev) => [...prev, botMsg]);

//       if (!open) setUnread((n) => n + 1);
//     // eslint-disable-next-line react-hooks/purity
//     }, 700 + Math.random() * 400);
//   }

//   function handleKeyDown(e) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   }

//   return (
//     <>
//       <div
//         className={`fixed bottom-24 right-6 z-50 w-[380px] transition-all duration-300 origin-bottom-right ${
//           open
//             ? "scale-100 opacity-100 pointer-events-auto"
//             : "scale-90 opacity-0 pointer-events-none"
//         }`}
//         style={{ maxHeight: "calc(100vh - 120px)" }}
//       >
//         <div
//           className="flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
//           style={{ height: "540px" }}
//         >
//           <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
//                 <Sparkles className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <p className="text-white font-semibold text-sm">Assistant IA</p>
//                 <p className="text-blue-200 text-xs flex items-center gap-1">
//                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
//                   En ligne · Rempli le formulaire
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setOpen(false)}
//               className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
//             >
//               <ChevronDown className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 {msg.role === "bot" && (
//                   <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
//                     <Plane className="w-3.5 h-3.5 text-white" />
//                   </div>
//                 )}
//                 <div
//                   className={`max-w-[260px] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
//                     msg.role === "user"
//                       ? "bg-blue-600 text-white rounded-tr-sm"
//                       : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
//                   }`}
//                 >
//                   {renderText(msg.text)}
//                 </div>
//               </div>
//             ))}

//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
//                   <Plane className="w-3.5 h-3.5 text-white" />
//                 </div>
//                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
//                   <div className="flex gap-1 items-center h-4">
//                     <span
//                       className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0ms" }}
//                     />
//                     <span
//                       className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "150ms" }}
//                     />
//                     <span
//                       className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "300ms" }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {showSuggestions && messages.length <= 1 && (
//               <div className="pt-1">
//                 <p className="text-xs text-gray-400 mb-2 text-center">
//                   Suggestions rapides
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {SUGGESTIONS.map((s) => (
//                     <button
//                       key={s}
//                       onClick={() => handleSend(s)}
//                       className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100">
//             <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
//               <textarea
//                 ref={inputRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Décrivez votre voyage..."
//                 rows={1}
//                 className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400 max-h-24"
//                 style={{ lineHeight: "1.5" }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={!input.trim()}
//                 className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
//               >
//                 <Send className="w-3.5 h-3.5" />
//               </button>
//             </div>
//             <p className="text-[10px] text-gray-400 text-center mt-1.5">
//               Appuyez sur Entrée pour envoyer · Shift+Entrée pour une nouvelle ligne
//             </p>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
//         style={{
//           background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
//         }}
//         aria-label="Ouvrir l'assistant IA"
//       >
//         {open ? (
//           <X className="w-6 h-6 text-white" />
//         ) : (
//           <Sparkles className="w-6 h-6 text-white" />
//         )}

//         {!open && (
//           <span className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20" />
//         )}

//         {unread > 0 && !open && (
//           <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
//             {unread}
//           </span>
//         )}
//       </button>
//     </>
//   );
// }
