import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plane,
  Check,
  CreditCard,
  Smartphone,
  ChevronRight,
  Shield,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Lock,
  Wifi,
  Copy,
} from "lucide-react";
import { Header } from "../composants/shared/Header";
import { airports } from "../data/mockFlights";
import axios from 'axios'

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "SKY-" +
    Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("")
  );
}

function randomSeat() {
  return `${Math.floor(Math.random() * 35) + 1}${["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)]}`;
}

function randomGate() {
  return `${["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 50) + 1}`;
}

function FakeQR({ value }) {
  const SIZE = 21;
  const seed = value
    .split("")
    .reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);

  const finderAt = (r, c, sr, sc) => {
    const ri = r - sr;
    const ci = c - sc;
    if (ri < 0 || ri >= 7 || ci < 0 || ci >= 7) return null;
    return (
      ri === 0 ||
      ri === 6 ||
      ci === 0 ||
      ci === 6 ||
      (ri >= 2 && ri <= 4 && ci >= 2 && ci <= 4)
    );
  };

  const bit = (i, j) => {
    const f1 = finderAt(i, j, 0, 0);
    const f2 = finderAt(i, j, 0, SIZE - 7);
    const f3 = finderAt(i, j, SIZE - 7, 0);
    if (f1 !== null) return f1;
    if (f2 !== null) return f2;
    if (f3 !== null) return f3;
    if (i === 6) return j % 2 === 0;
    if (j === 6) return i % 2 === 0;
    const h = Math.abs(
      (seed * (i * SIZE + j + 1) * 1103515245 + 12345) & 0x7fffffff,
    );
    return h % 3 !== 0;
  };

  return (
    <svg
      width={96}
      height={96}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ imageRendering: "pixelated" }}
    >
      <rect width={SIZE} height={SIZE} fill="white" />
      {Array.from({ length: SIZE }, (_, i) =>
        Array.from({ length: SIZE }, (_, j) =>
          bit(i, j) ? (
            <rect
              key={`${i}-${j}`}
              x={j}
              y={i}
              width={1}
              height={1}
              fill="#0f172a"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function Barcode({ value }) {
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bars = Array.from({ length: 60 }, (_, i) => {
    const h = Math.abs(
      (seed * (i + 1) * 6364136223846793005n + 1442695040888963407n) & 0xffff,
    );
    return { width: (h % 3) + 1, dark: h % 5 !== 0 };
  });

  return (
    <div className="flex items-center h-10 gap-px">
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            width: b.width,
            backgroundColor: b.dark ? "#0f172a" : "transparent",
          }}
          className="h-full"
        />
      ))}
    </div>
  );
}

const MTN_LOGO = () => (
  <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
    <span className="text-[8px] font-black text-black leading-none text-center">
      MTN
      <br />
      MoMo
    </span>
  </div>
);

const ORANGE_LOGO = () => (
  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
    <span className="text-[9px] font-black text-white">OM</span>
  </div>
);

const WAVE_LOGO = () => (
  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
    <span className="text-[9px] font-black text-white">Wave</span>
  </div>
);

const STEPS = [
  { key: "review", label: "Récapitulatif" },
  { key: "payment", label: "Paiement" },
  { key: "ticket", label: "Billet" },
];

function ProgressBar({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;

        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  active
                    ? "text-blue-600"
                    : done
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${done ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepReview({
  currentUser,
  originAirport,
  destAirport,
  totalPrice,
  passengersParam,
  flight,
  onContinue,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Récapitulatif de votre vol
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Vérifiez les détails avant de passer au paiement
      </p>

      <FlightCard
        flight={flight}
        totalPrice={totalPrice}
        passengersParam={passengersParam}
        originAirport={originAirport}
        destAirport={destAirport}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> Passager principal
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Prénom
            </label>
            <p className="font-medium text-gray-900">
              {currentUser.name?.split(" ")[0] || "—"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nom
            </label>
            <p className="font-medium text-gray-900">
              {currentUser.name?.split(" ")[1] || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="font-medium text-gray-900">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Services inclus</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Bagage cabine (8 kg)",
            "Sélection de siège",
            "Repas à bord",
            "Divertissement",
          ].map((s) => (
            <div
              key={s}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>

      <PriceTable
        flight={flight}
        passengersParam={passengersParam}
        totalPrice={totalPrice}
      />

      <button
        onClick={onContinue}
        className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
      >
        Continuer vers le paiement <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function FlightCard({
  flight,
  totalPrice,
  passengersParam,
  originAirport,
  destAirport,
}) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
            {flight.airline}
          </p>
          <p className="font-semibold">{flight.flightNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalPrice} €</p>
          <p className="text-blue-200 text-xs">
            {passengersParam} passager{passengersParam > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">{flight.departureTime}</p>
          <p className="text-sm text-blue-200">{originAirport?.city}</p>
          <p className="text-xs text-blue-300">({flight.origin})</p>
        </div>

        <div className="flex flex-col items-center gap-1 px-4">
          <p className="text-xs text-blue-200">{flight.duration}</p>
          <div className="flex items-center gap-1 w-24">
            <div className="h-px bg-blue-400 flex-1" />
            <Plane className="w-4 h-4 text-blue-300" />
            <div className="h-px bg-blue-400 flex-1" />
          </div>
          <p className="text-xs text-blue-200">
            {flight.stops === 0 ? "Direct" : `${flight.stops} escale`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold">{flight.arrivalTime}</p>
          <p className="text-sm text-blue-200">{destAirport?.city}</p>
          <p className="text-xs text-blue-300">({flight.destination})</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-500/40 flex items-center gap-4 text-xs text-blue-200">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />{" "}
          {new Date(`${flight.date || ""}T12:00:00`).toLocaleDateString(
            "fr-FR",
            {
              weekday: "short",
              day: "numeric",
              month: "short",
            },
          )}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {passengersParam} passager
          {passengersParam > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {flight.duration}
        </span>
      </div>
    </div>
  );
}

function PriceTable({ flight, passengersParam, totalPrice }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Tarif de base × {passengersParam}</span>
        <span>{(flight.price - 50) * passengersParam} €</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Taxes et frais</span>
        <span>{50 * passengersParam} €</span>
      </div>
      <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
        <span>Total</span>
        <span className="text-blue-600">{totalPrice} €</span>
      </div>
    </div>
  );
}

function StepPayment({
  flight,
  totalPrice,
  payMethod,
  setPayMethod,
  payState,
  setPayState,
  phone,
  setPhone,
  otp,
  setOtp,
  cardNum,
  setCardNum,
  cardExp,
  setCardExp,
  cardCvv,
  setCardCvv,
  onConfirmOtp,
  onTriggerPayment,
  originAirport,
  destAirport,
  passengersParam,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Paiement sécurisé
      </h2>

     

      <FlightCard
        flight={flight}
        totalPrice={totalPrice}
        passengersParam={passengersParam}
        originAirport={originAirport}
        destAirport={destAirport}
      />
      <PriceTable
        flight={flight}
        passengersParam={passengersParam}
        totalPrice={totalPrice}
      />

      <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">
            Choisissez votre méthode de paiement
          </h3>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Mobile Money
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["mtn", "orange", "wave"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setPayMethod(m);
                    setPayState("idle");
                  }}
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${
                    payMethod === m
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {m === "mtn" && <MTN_LOGO />}
                  {m === "orange" && <ORANGE_LOGO />}
                  {m === "wave" && <WAVE_LOGO />}
                  <span className="text-xs font-medium text-gray-700">
                    {m === "mtn"
                      ? "MTN MoMo"
                      : m === "orange"
                        ? "Orange Money"
                        : "Wave"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Carte bancaire
            </p>
            <button
              type="button"
              onClick={() => {
                setPayMethod("card");
                setPayState("idle");
              }}
              className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
                payMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">
                  Carte Visa / Mastercard
                </p>
                <p className="text-xs text-gray-500">Paiement sécurisé SSL</p>
              </div>
            </button>
          </div>
        </div>

        <div className="p-5">
          {(payMethod === "mtn" ||
            payMethod === "orange" ||
            payMethod === "wave") &&
            payState === "idle" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone{" "}
                  {payMethod === "mtn"
                    ? "(MTN)"
                    : payMethod === "orange"
                      ? "(Orange)"
                      : "(Wave)"}
                </label>
                <div className="flex gap-2">
                  <div className="w-16 px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-600 text-center font-medium bg-gray-50">
                    🌍 +XX
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="07 00 00 00 00"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

          {payMethod === "card" && payState === "idle" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  value={cardNum}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCardNum(raw.replace(/(.{4})/g, "$1 ").trim());
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                      setCardExp(v);
                    }}
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="•••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {payState === "sending" && (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-medium text-gray-800">
                Envoi de la demande...
              </p>
            </div>
          )}

          {payState === "otp" && (
            <div>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">
                  Code de confirmation
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const arr = otp.split("");
                      arr[i] = v;
                      setOtp(arr.join("").slice(0, 4));
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                ))}
              </div>

              <button
                onClick={onConfirmOtp}
                disabled={otp.length < 4}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-40 transition-colors"
              >
                Confirmer le paiement
              </button>
            </div>
          )}

          {payState === "verifying" && (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-medium text-gray-800">
                Vérification du paiement...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Finalisation de votre réservation
              </p>
            </div>
          )}

          {payState === "idle" && (
            <button
              onClick={onTriggerPayment}
              disabled={
                payMethod === "card"
                  ? cardNum.replace(/\s/g, "").length < 16 ||
                    cardExp.length !== 5 ||
                    cardCvv.length < 3
                  : phone.length < 8
              }
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Lock className="w-4 h-4" /> Payer {totalPrice} €
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
        <Shield className="w-4 h-4" /> Paiement chiffré SSL 256 bits
        <span>·</span>
        <Lock className="w-4 h-4" /> Données sécurisées
      </div>
    </div>
  );
}

function StepTicket({
  booking,
  originAirport,
  destAirport,
  currentUser,
  copied,
  setCopied,
  navigate,
}) {
  if (!booking) return null;
  const dep = new Date(booking.date + "T12:00:00");

  function copyRef() {
    navigator.clipboard.writeText(booking.ref).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Paiement confirmé !
        </h2>
        <p className="text-gray-500 mt-1">
          Votre réservation est validée. Bon voyage ! ✈️
        </p>

        <div className="inline-flex items-center gap-2 mt-3 bg-gray-100 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-500">Référence :</span>
          <span className="font-mono font-bold text-gray-900 tracking-widest">
            {booking.ref}
          </span>
          <button
            onClick={copyRef}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 border border-gray-100">
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none">
                  {booking.airline}
                </p>
                <p className="text-blue-300 text-sm">{booking.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-300 uppercase tracking-wider">
                Billet électronique
              </p>
              <p className="text-sm font-semibold">{booking.ref}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {booking.origin}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {booking.departureTime}
              </p>
              <p className="text-sm text-gray-500">{originAirport?.city}</p>
            </div>

            <div className="flex flex-col items-center gap-1 text-gray-400">
              <p className="text-xs">{booking.duration}</p>
              <div className="flex items-center gap-1">
                <div className="w-8 h-px bg-gray-400" />
                <Plane className="w-4 h-4 text-blue-500 rotate-90" />
                <div className="w-8 h-px bg-gray-400" />
              </div>
              <p className="text-xs">Direct</p>
            </div>

            <div className="text-right">
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {booking.destination}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {booking.arrivalTime}
              </p>
              <p className="text-sm text-gray-500">{destAirport?.city}</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center px-0">
          <div className="absolute -left-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-6" />
          <div className="absolute -right-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
        </div>

        <div className="px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Passager
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {booking.passengerName.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Siège
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {booking.seat}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Date
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {dep
                  .toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Porte
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {booking.gate}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Classe
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {booking.cabinClass}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Paiement
              </p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {booking.payMethod}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
              <FakeQR value={booking.ref} />
            </div>
            <p className="text-[10px] text-gray-400 font-mono">{booking.ref}</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex flex-col items-center gap-1">
          <Barcode value={booking.ref} />
          <p className="font-mono text-[10px] text-gray-400 tracking-widest">
            {booking.ref.replace("SKY-", "").split("").join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">
        <Wifi className="w-4 h-4 flex-shrink-0" />
        <span>
          Ce billet a été envoyé à <strong>{currentUser.email}</strong>.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/dashboard?tab=trips")}
          className="py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plane className="w-4 h-4" /> Mes voyages
        </button>
        <button
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" /> Télécharger
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </button>
    </div>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const flightId = searchParams.get("flightId") || "";
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const passengersParam = parseInt(searchParams.get("passengers") || "1");

  const [step, setStep] = useState("review");
  const [flight] = useState(() => {
    const storedResults = JSON.parse(
      localStorage.getItem("searchResults") || "[]",
    );
    return storedResults.find((f) => f.id === flightId) || null;
  });
  const [payMethod, setPayMethod] = useState("mtn");
  const [payState, setPayState] = useState("idle");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [booking, setBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const reservationId = searchParams.get('id');

    if (status === 'success' && stepParam === 'ticket' && reservationId) {
      axios.get(`http://localhost:3000/api/reservations/${reservationId}`)
        .then(response => {
          const resData = response.data;
          
          setBooking({
            ref: resData.reservation_reference,
            airline: "Compagnie Aérienne", 
            flightNumber: "FL-" + resData.vol_id,
            origin: "DLA", 
            destination: "NSI",
            departureTime: "14:00",
            arrivalTime: "15:00",
            duration: "1h 00m",
            passengerName: "Client", 
            seat: "12A",
            date: "2026-07-25", 
            gate: "A02",
            cabinClass: resData.classe || "Économique",
            payMethod: "NotchPay",
          });

          setStep("ticket");
        })
        .catch(error => console.error("Erreur API:", error));
    }
  }, [searchParams]); 

  //  Le hook useEffect pour corriger l'URL du billet perdu :
  useEffect(() => {
    const status = searchParams.get("status");
    const hasFlightId = searchParams.get("flightId");
    
    if (status === "success" && !hasFlightId) {
      const savedParams = localStorage.getItem("pendingFlightParams");
      
      if (savedParams) {
        localStorage.removeItem("pendingFlightParams");
        const cleanParams = savedParams.replace("?", "");
        // On redirige sur la même page mais avec toutes les données
        navigate(`/checkout?step=ticket&status=success&${cleanParams}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
  const status = searchParams.get("status");
  const stepParam = searchParams.get("step");

  if (status === "success" && stepParam === "ticket") {
    // eslint-disable-next-line react-hooks/immutability
    completePayment();
  }
}, [completePayment, searchParams]);


  useEffect(() => {
    const u = localStorage.getItem("currentUser");
    if (!u) {
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(JSON.parse(u));
  }, [navigate]);

  if (!currentUser) return null;

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
          <p className="text-xl font-semibold text-gray-900 mb-3">
            Vol introuvable
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Les résultats de recherche ne sont pas disponibles pour ce vol.
            Retournez à la page de résultats et réessayez.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

console.log("Flight =", flight);
console.log("Search =", localStorage.getItem("searchResults"));

  const originAirport = airports.find((a) => a.code === flight.origin);
  const destAirport = airports.find((a) => a.code === flight.destination);
  const totalPrice = flight.price * passengersParam;

 
  async function triggerPayment(){

    try {

        setPayState("sending");

        // 1️⃣ Créer la réservation

        const reservation = await fetch(
            "http://localhost:3000/api/reservations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user_id: currentUser.id,

                    vol_id: flight.id,

                    nombre_adultes: passengersParam,

                    nombre_enfants: 0,

                    classe: flight.cabinClass,

                    prix_total: totalPrice

                })

            }
        );


        const reservationData = await reservation.json();

         try {
    // 💾 Sauvegarde des paramètres de l'URL actuelle dans le localStorage
    const currentQueryParams = window.location.search; 
    localStorage.setItem("pendingFlightParams", currentQueryParams);

    // Votre appel API Notch Pay existant...
    // eslint-disable-next-line no-undef
    const res = await axios.post("http://localhost:3000/api/payments/create", paymentData);
    if (res.data.url) {
      window.location.href = res.data.url; // Redirection Notch Pay
    }
  } catch (error) {
    console.error(error);
  }

        // 2️⃣ Créer le paiement NotchPay

        const response = await fetch("http://localhost:3000/api/payment/create",
{
 method:"POST",

 headers:{
 "Content-Type":"application/json"
 },

 body:JSON.stringify({
   reservationId: reservationData.reservationId,

    amount: totalPrice,

    email: currentUser.email,

    phone: phone || currentUser.phone,

    description: "Paiement AeroPrix"


//  amount: totalPrice,
//  email: currentUser.email,
//  phone: phone,
//  description:
//  `Billet ${flight.origin}-${flight.destination}`
 })
}
);


        const data = await response.json();

        // 3️⃣ Redirection

        if(data.authorization_url){
            window.location.href = data.authorization_url;
        }

    } catch(error){

        console.log(error);

        setPayState("idle");
    }

}

// try{

// setPayState("sending");


// // const response = await fetch(
// // "http://localhost:5000/api/payment/create",
// // {
// // method:"POST",

// // headers:{
// // "Content-Type":"application/json"
// // },

// // body:JSON.stringify({

// // amount: totalPrice * 655,

// // email: currentUser.email,

// // phone: phone,

// // description:
// // `Billet avion ${flight.origin}-${flight.destination}`

// // })

// // }
// // );
// const response = await fetch(
// "http://localhost:3000/api/payment/create",
// {
//  method:"POST",

//  headers:{
//  "Content-Type":"application/json"
//  },

//  body:JSON.stringify({
//    reservationId: reservationData.reservationId,

//     amount: totalPrice,

//     email: currentUser.email,

//     phone: phone || currentUser.phone,

//     description: "Paiement AeroPrix"


// //  amount: totalPrice,
// //  email: currentUser.email,
// //  phone: phone,
// //  description:
// //  `Billet ${flight.origin}-${flight.destination}`
//  })
// }
// );

// try {

//         setPayState("sending");

//         // ===========================
//         // Création de la réservation
//         // ===========================

//         const reservation = await fetch(
//             "http://localhost:3000/api/reservations",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },

//                 body: JSON.stringify({

//                     user_id: currentUser.id,

//                     vol_id: flight.id,

//                     nombre_adultes: passengersParam,

//                     nombre_enfants: 0,

//                     classe: flight.cabinClass,

//                     prix_total: totalPrice

//                 })

//             }
//         );

//         const reservationData =await reservation.json();

//         console.log(reservationData);

// const data = await response.json();


// console.log("NOTCHPAY RESPONSE :",data);



// if(data.authorization_url){

// window.location.href =
// data.authorization_url;

// }



// }catch(error){

// console.log(error);

// setPayState("idle");

// }

// }

  function confirmOtp() {
    setPayState("verifying");
    setTimeout(() => completePayment(), 2000);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function completePayment() {
    if (booking) return;

    const ref = genRef();
    const seat = randomSeat();
    const gate = randomGate();

    const payLabels = {
      mtn: "MTN Mobile Money",
      orange: "Orange Money",
      wave: "Wave",
      card: "Carte bancaire",
    };

    const newBooking = {
      ref,
      flightId: flight.id,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      date,
      duration: flight.duration,
      price: totalPrice,
      passengers: passengersParam,
      passengerName: currentUser.name || "Passager",
      seat,
      gate,
      cabinClass: flight.cabinClass,
      payMethod: payLabels[payMethod],
      bookedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");
    localStorage.setItem("bookings", JSON.stringify([newBooking, ...existing]));

    setBooking(newBooking);
    setPayState("done");
    setStep("ticket");
  }

  // eslint-disable-next-line no-unused-vars
  const canPay =
    payMethod === "card"
      ? cardNum.replace(/\s/g, "").length >= 16 &&
        cardExp.length === 5 &&
        cardCvv.length >= 3
      : phone.length >= 8;
    


  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar current={step} />
        {step === "review" && (
          <StepReview
            booking={booking}
            currentUser={currentUser}
            originAirport={originAirport}
            destAirport={destAirport}
            totalPrice={totalPrice}
            passengersParam={passengersParam}
            flight={flight}
            onContinue={() => setStep("payment")}
          />
        )}
        {step === "payment" && (
          <StepPayment
            flight={flight}
            totalPrice={totalPrice}
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            payState={payState}
            setPayState={setPayState}
            phone={phone}
            setPhone={setPhone}
            otp={otp}
            setOtp={setOtp}
            cardNum={cardNum}
            setCardNum={setCardNum}
            cardExp={cardExp}
            setCardExp={setCardExp}
            cardCvv={cardCvv}
            setCardCvv={setCardCvv}
            onConfirmOtp={confirmOtp}
            onTriggerPayment={triggerPayment}
            originAirport={originAirport}
            destAirport={destAirport}
            passengersParam={passengersParam}
          />
        )}
        {step === "ticket" && (
          <StepTicket
            booking={booking}
            originAirport={originAirport}
            destAirport={destAirport}
            currentUser={currentUser}
            copied={copied}
            setCopied={setCopied}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}











































































































// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router";
// import {
//   Plane, Check, CreditCard, Smartphone, ChevronRight,
//   Shield, Download, ArrowLeft, CheckCircle2, Clock,
//   Calendar, Users, Lock, Wifi, AlertTriangle, Copy,
// } from "lucide-react";
// import { Header } from "../components/Header";
// import { generateMockFlights, airports } from "../data/mockFlights";

// function genRef() {
//   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
//   return "SKY-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
// }

// function randomSeat() {
//   return `${Math.floor(Math.random() * 35) + 1}${["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)]}`;
// }

// function randomGate() {
//   return `${["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 50) + 1}`;
// }

// function FakeQR({ value }) {
//   const SIZE = 21;
//   const seed = value.split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);

//   const finderAt = (r, c, sr, sc) => {
//     const ri = r - sr;
//     const ci = c - sc;
//     if (ri < 0 || ri >= 7 || ci < 0 || ci >= 7) return null;
//     return (
//       ri === 0 ||
//       ri === 6 ||
//       ci === 0 ||
//       ci === 6 ||
//       (ri >= 2 && ri <= 4 && ci >= 2 && ci <= 4)
//     );
//   };

//   const bit = (i, j) => {
//     const f1 = finderAt(i, j, 0, 0);
//     const f2 = finderAt(i, j, 0, SIZE - 7);
//     const f3 = finderAt(i, j, SIZE - 7, 0);
//     if (f1 !== null) return f1;
//     if (f2 !== null) return f2;
//     if (f3 !== null) return f3;
//     if (i === 6) return j % 2 === 0;
//     if (j === 6) return i % 2 === 0;
//     const h = Math.abs((seed * (i * SIZE + j + 1) * 1103515245 + 12345) & 0x7fffffff);
//     return h % 3 !== 0;
//   };

//   return (
//     <svg width={96} height={96} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ imageRendering: "pixelated" }}>
//       <rect width={SIZE} height={SIZE} fill="white" />
//       {Array.from({ length: SIZE }, (_, i) =>
//         Array.from({ length: SIZE }, (_, j) =>
//           bit(i, j) ? <rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} fill="#0f172a" /> : null
//         )
//       )}
//     </svg>
//   );
// }

// function Barcode({ value }) {
//   const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
//   const bars = Array.from({ length: 60 }, (_, i) => {
//     const h = Math.abs((seed * (i + 1) * 6364136223846793005 + 1442695040888963407) & 0xffff);
//     return { width: (h % 3) + 1, dark: h % 5 !== 0 };
//   });

//   return (
//     <div className="flex items-center h-10 gap-px">
//       {bars.map((b, i) => (
//         <div
//           key={i}
//           style={{ width: b.width, backgroundColor: b.dark ? "#0f172a" : "transparent" }}
//           className="h-full"
//         />
//       ))}
//     </div>
//   );
// }

// const MTN_LOGO = () => (
//   <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
//     <span className="text-[8px] font-black text-black leading-none text-center">
//       MTN<br />
//       MoMo
//     </span>
//   </div>
// );

// const ORANGE_LOGO = () => (
//   <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
//     <span className="text-[9px] font-black text-white">OM</span>
//   </div>
// );

// const WAVE_LOGO = () => (
//   <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
//     <span className="text-[9px] font-black text-white">Wave</span>
//   </div>
// );

// const STEPS = [
//   { key: "review", label: "Récapitulatif" },
//   { key: "payment", label: "Paiement" },
//   { key: "ticket", label: "Billet" },
// ];

// function ProgressBar({ current }) {
//   const idx = STEPS.findIndex((s) => s.key === current);

//   return (
//     <div className="flex items-center gap-0 mb-8">
//       {STEPS.map((step, i) => {
//         const done = i < idx;
//         const active = i === idx;

//         return (
//           <div key={step.key} className="flex items-center flex-1 last:flex-none">
//             <div className="flex flex-col items-center">
//               <div
//                 className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                   done
//                     ? "bg-green-500 text-white"
//                     : active
//                     ? "bg-blue-600 text-white ring-4 ring-blue-100"
//                     : "bg-gray-200 text-gray-500"
//                 }`}
//               >
//                 {done ? <Check className="w-4 h-4" /> : i + 1}
//               </div>
//               <span
//                 className={`text-xs mt-1.5 font-medium ${
//                   active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"
//                 }`}
//               >
//                 {step.label}
//               </span>
//             </div>

//             {i < STEPS.length - 1 && (
//               <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${done ? "bg-green-400" : "bg-gray-200"}`} />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // Composants sortis du composant principal
// function StepReview({ booking, onNext }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Revue de la réservation</h2>

//       <div className="space-y-3 text-gray-700">
//         <p><strong>Vol :</strong> {booking.flightNumber}</p>
//         <p><strong>Compagnie :</strong> {booking.airline}</p>
//         <p><strong>Départ :</strong> {booking.origin}</p>
//         <p><strong>Destination :</strong> {booking.destination}</p>
//         <p><strong>Date :</strong> {booking.date}</p>
//       </div>

//       <button
//         onClick={onNext}
//         className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//       >
//         Continuer
//       </button>
//     </div>
//   );
// }

// function StepPayment({ booking, onBack, onPay }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Paiement</h2>

//       <div className="space-y-3 text-gray-700">
//         <p><strong>Total :</strong> {booking.price}€</p>
//         <p>Choisis ton moyen de paiement.</p>
//       </div>

//       <div className="flex gap-3 mt-6">
//         <button
//           onClick={onBack}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//         >
//           Retour
//         </button>
//         <button
//           onClick={onPay}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//         >
//           Payer maintenant
//         </button>
//       </div>
//     </div>
//   );
// }

// function StepTicket({ booking }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Billet confirmé</h2>
//       <p className="text-gray-700">
//         Votre réservation pour le vol {booking.flightNumber} est confirmée.
//       </p>
//     </div>
//   );
// }

// export function Checkout() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const flightId = searchParams.get("flightId") || "";
//   const origin = searchParams.get("origin") || "CDG";
//   const destination = searchParams.get("destination") || "JFK";
//   const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
//   const passengersParam = parseInt(searchParams.get("passengers") || "1");

//   const [step, setStep] = useState("review");
//   const [payMethod, setPayMethod] = useState("mtn");
//   const [payState, setPayState] = useState("idle");
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [cardNum, setCardNum] = useState("");
//   const [cardExp, setCardExp] = useState("");
//   const [cardCvv, setCardCvv] = useState("");
//   const [booking, setBooking] = useState(null);
//   const [copied, setCopied] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);

//   useEffect(() => {
//     const u = localStorage.getItem("currentUser");
//     if (!u) {
//       navigate("/");
//       return;
//     }
//     setCurrentUser(JSON.parse(u));
//   }, [navigate]);

//   const flights = generateMockFlights(origin, destination, date);
//   const flight = flights.find((f) => f.id === flightId) || flights[0];

//   if (!flight || !currentUser) return null;

//   const originAirport = airports.find((a) => a.code === flight.origin);
//   const destAirport = airports.find((a) => a.code === flight.destination);
//   const totalPrice = flight.price * passengersParam;

//   const FlightCard = () => (
//     <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-6 shadow-lg">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">{flight.airline}</p>
//           <p className="font-semibold">{flight.flightNumber}</p>
//         </div>
//         <div className="text-right">
//           <p className="text-2xl font-bold">{totalPrice} €</p>
//           <p className="text-blue-200 text-xs">{passengersParam} passager{passengersParam > 1 ? "s" : ""}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-3xl font-bold">{flight.departureTime}</p>
//           <p className="text-sm text-blue-200">{originAirport?.city}</p>
//           <p className="text-xs text-blue-300">({flight.origin})</p>
//         </div>

//         <div className="flex flex-col items-center gap-1 px-4">
//           <p className="text-xs text-blue-200">{flight.duration}</p>
//           <div className="flex items-center gap-1 w-24">
//             <div className="h-px bg-blue-400 flex-1" />
//             <Plane className="w-4 h-4 text-blue-300" />
//             <div className="h-px bg-blue-400 flex-1" />
//           </div>
//           <p className="text-xs text-blue-200">{flight.stops === 0 ? "Direct" : `${flight.stops} escale`}</p>
//         </div>

//         <div className="text-right">
//           <p className="text-3xl font-bold">{flight.arrivalTime}</p>
//           <p className="text-sm text-blue-200">{destAirport?.city}</p>
//           <p className="text-xs text-blue-300">({flight.destination})</p>
//         </div>
//       </div>

//       <div className="mt-4 pt-4 border-t border-blue-500/40 flex items-center gap-4 text-xs text-blue-200">
//         <span className="flex items-center gap-1">
//           <Calendar className="w-3 h-3" />{" "}
//           {new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
//             weekday: "short",
//             day: "numeric",
//             month: "short",
//           })}
//         </span>
//         <span className="flex items-center gap-1">
//           <Users className="w-3 h-3" /> {passengersParam} passager{passengersParam > 1 ? "s" : ""}
//         </span>
//         <span className="flex items-center gap-1">
//           <Clock className="w-3 h-3" /> {flight.duration}
//         </span>
//       </div>
//     </div>
//   );

//   const PriceTable = () => (
//     <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
//       <div className="flex justify-between text-gray-600">
//         <span>Tarif de base × {passengersParam}</span>
//         <span>{(flight.price - 50) * passengersParam} €</span>
//       </div>
//       <div className="flex justify-between text-gray-600">
//         <span>Taxes et frais</span>
//         <span>{50 * passengersParam} €</span>
//       </div>
//       <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
//         <span>Total</span>
//         <span className="text-blue-600">{totalPrice} €</span>
//       </div>
//     </div>
//   );

//   function triggerPayment() {
//     setPayState("sending");
//     setTimeout(() => {
//       if (payMethod === "card") {
//         setPayState("verifying");
//         setTimeout(() => completePayment(), 2000);
//       } else {
//         setPayState("otp");
//       }
//     }, 2000);
//   }

//   function confirmOtp() {
//     setPayState("verifying");
//     setTimeout(() => completePayment(), 2000);
//   }

//   function completePayment() {
//     const ref = genRef();
//     const seat = randomSeat();
//     const gate = randomGate();

//     const payLabels = {
//       mtn: "MTN Mobile Money",
//       orange: "Orange Money",
//       wave: "Wave",
//       card: "Carte bancaire",
//     };

//     const newBooking = {
//       ref,
//       flightId: flight.id,
//       airline: flight.airline,
//       flightNumber: flight.flightNumber,
//       origin: flight.origin,
//       destination: flight.destination,
//       departureTime: flight.departureTime,
//       arrivalTime: flight.arrivalTime,
//       date,
//       duration: flight.duration,
//       price: totalPrice,
//       passengers: passengersParam,
//       passengerName: currentUser.name || "Passager",
//       seat,
//       gate,
//       cabinClass: flight.cabinClass,
//       payMethod: payLabels[payMethod],
//       bookedAt: new Date().toISOString(),
//     };

//     const existing = JSON.parse(localStorage.getItem("bookings") || "[]");
//     localStorage.setItem("bookings", JSON.stringify([newBooking, ...existing]));

//     setBooking(newBooking);
//     setPayState("done");
//     setStep("ticket");
//   }

//   const canPay =
//     payMethod === "card"
//       ? cardNum.replace(/\s/g, "").length >= 16 && cardExp.length === 5 && cardCvv.length >= 3
//       : phone.length >= 8;

//   const StepReview = () => (
//     <div>
//       <h2 className="text-xl font-bold text-gray-900 mb-1">Récapitulatif de votre vol</h2>
//       <p className="text-gray-500 text-sm mb-6">Vérifiez les détails avant de passer au paiement</p>

//       <FlightCard />

//       <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
//         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//           <Users className="w-4 h-4 text-blue-600" /> Passager principal
//         </h3>
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
//             <p className="font-medium text-gray-900">{currentUser.name?.split(" ")[0] || "—"}</p>
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
//             <p className="font-medium text-gray-900">{currentUser.name?.split(" ")[1] || "—"}</p>
//           </div>
//           <div className="col-span-2">
//             <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
//             <p className="font-medium text-gray-900">{currentUser.email}</p>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
//         <h3 className="font-semibold text-gray-900 mb-3">Services inclus</h3>
//         <div className="grid grid-cols-2 gap-2">
//           {["Bagage cabine (8 kg)", "Sélection de siège", "Repas à bord", "Divertissement"].map((s) => (
//             <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
//               <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                 <Check className="w-3 h-3 text-green-600" />
//               </div>
//               {s}
//             </div>
//           ))}
//         </div>
//       </div>

//       <PriceTable />

//       <button
//         onClick={() => setStep("payment")}
//         className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
//       >
//         Continuer vers le paiement <ChevronRight className="w-5 h-5" />
//       </button>
//     </div>
//   );

//   function StepPayment() {
//     return (
//       <div>
//         <h2 className="text-xl font-bold text-gray-900 mb-1">Paiement sécurisé</h2>

//         <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm">
//           <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
//           <span className="text-amber-800">
//             <strong>MODE SANDBOX</strong> — Aucun paiement réel n'est effectué. Utilisez n'importe quelles données de test.
//           </span>
//         </div>

//         <FlightCard />
//         <PriceTable />

//         <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//           <div className="p-5 border-b border-gray-100">
//             <h3 className="font-semibold text-gray-900 mb-4">Choisissez votre méthode de paiement</h3>

//             <div className="mb-4">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mobile Money</p>
//               <div className="grid grid-cols-3 gap-2">
//                 {["mtn", "orange", "wave"].map((m) => (
//                   <button
//                     key={m}
//                     type="button"
//                     onClick={() => {
//                       setPayMethod(m);
//                       setPayState("idle");
//                     }}
//                     className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${
//                       payMethod === m ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
//                     }`}
//                   >
//                     {m === "mtn" && <MTN_LOGO />}
//                     {m === "orange" && <ORANGE_LOGO />}
//                     {m === "wave" && <WAVE_LOGO />}
//                     <span className="text-xs font-medium text-gray-700">
//                       {m === "mtn" ? "MTN MoMo" : m === "orange" ? "Orange Money" : "Wave"}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Carte bancaire</p>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setPayMethod("card");
//                   setPayState("idle");
//                 }}
//                 className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
//                   payMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
//                 }`}
//               >
//                 <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
//                   <CreditCard className="w-5 h-5 text-white" />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-sm font-medium text-gray-800">Carte Visa / Mastercard</p>
//                   <p className="text-xs text-gray-500">Paiement sécurisé SSL</p>
//                 </div>
//               </button>
//             </div>
//           </div>

//           <div className="p-5">
//             {(payMethod === "mtn" || payMethod === "orange" || payMethod === "wave") && payState === "idle" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Numéro de téléphone {payMethod === "mtn" ? "(MTN)" : payMethod === "orange" ? "(Orange)" : "(Wave)"}
//                 </label>
//                 <div className="flex gap-2">
//                   <div className="w-16 px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-600 text-center font-medium bg-gray-50">
//                     🌍 +XX
//                   </div>
//                   <input
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//                     placeholder="07 00 00 00 00"
//                     className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2">
//                   Un message de confirmation vous sera envoyé pour autoriser le paiement.
//                 </p>
//               </div>
//             )}

//             {payMethod === "card" && payState === "idle" && (
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
//                   <input
//                     type="text"
//                     value={cardNum}
//                     onChange={(e) => {
//                       const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
//                       setCardNum(raw.replace(/(.{4})/g, "$1 ").trim());
//                     }}
//                     placeholder="1234 5678 9012 3456"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono tracking-widest"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
//                     <input
//                       type="text"
//                       value={cardExp}
//                       onChange={(e) => {
//                         let v = e.target.value.replace(/\D/g, "").slice(0, 4);
//                         if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
//                         setCardExp(v);
//                       }}
//                       placeholder="MM/AA"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
//                     <input
//                       type="text"
//                       value={cardCvv}
//                       onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
//                       placeholder="•••"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {payState === "sending" && (
//               <div className="flex flex-col items-center py-6">
//                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
//                 <p className="font-medium text-gray-800">Envoi de la demande...</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {payMethod === "card"
//                     ? "Sécurisation du paiement en cours"
//                     : `Contacting ${payMethod === "mtn" ? "MTN" : payMethod === "orange" ? "Orange" : "Wave"}...`}
//                 </p>
//               </div>
//             )}

//             {payState === "otp" && (
//               <div>
//                 <div className="text-center mb-4">
//                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <Smartphone className="w-6 h-6 text-green-600" />
//                   </div>
//                   <p className="font-semibold text-gray-900">Code de confirmation</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Un SMS a été envoyé au <strong>+XX {phone}</strong>.
//                     <br />
//                     Entrez le code reçu pour confirmer.
//                   </p>
//                 </div>

//                 <div className="flex justify-center gap-3 mb-4">
//                   {Array.from({ length: 4 }).map((_, i) => (
//                     <input
//                       key={i}
//                       type="text"
//                       maxLength={1}
//                       value={otp[i] || ""}
//                       onChange={(e) => {
//                         const v = e.target.value.replace(/\D/g, "");
//                         const arr = otp.split("");
//                         arr[i] = v;
//                         setOtp(arr.join("").slice(0, 4));
//                         if (v && i < 3) {
//                           const next = document.getElementById(`otp-${i + 1}`);
//                           next?.focus();
//                         }
//                       }}
//                       id={`otp-${i}`}
//                       className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
//                     />
//                   ))}
//                 </div>

//                 <p className="text-xs text-center text-gray-400 mb-4">
//                   Mode sandbox — entrez n'importe quel code à 4 chiffres
//                 </p>

//                 <button
//                   onClick={confirmOtp}
//                   disabled={otp.length < 4}
//                   className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-40 transition-colors"
//                 >
//                   Confirmer le paiement
//                 </button>
//               </div>
//             )}

//             {payState === "verifying" && (
//               <div className="flex flex-col items-center py-6">
//                 <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
//                 <p className="font-medium text-gray-800">Vérification du paiement...</p>
//                 <p className="text-sm text-gray-500 mt-1">Finalisation de votre réservation</p>
//               </div>
//             )}

//             {payState === "idle" && (
//               <button
//                 onClick={triggerPayment}
//                 disabled={!canPay}
//                 className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
//               >
//                 <Lock className="w-4 h-4" /> Payer {totalPrice} €
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
//           <Shield className="w-4 h-4" /> Paiement chiffré SSL 256 bits
//           <span>·</span>
//           <Lock className="w-4 h-4" /> Données sécurisées
//         </div>
//       </div>
//     );
//   }

//   const StepTicket = () => {
//     if (!booking) return null;
//     const dep = new Date(booking.date + "T12:00:00");

//     function copyRef() {
//       navigator.clipboard.writeText(booking.ref).catch(() => {});
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }

//     return (
//       <div>
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <CheckCircle2 className="w-10 h-10 text-green-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900">Paiement confirmé !</h2>
//           <p className="text-gray-500 mt-1">Votre réservation est validée. Bon voyage ! ✈️</p>

//           <div className="inline-flex items-center gap-2 mt-3 bg-gray-100 rounded-lg px-4 py-2">
//             <span className="text-sm text-gray-500">Référence :</span>
//             <span className="font-mono font-bold text-gray-900 tracking-widest">{booking.ref}</span>
//             <button onClick={copyRef} className="text-blue-600 hover:text-blue-700 transition-colors">
//               {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 border border-gray-100">
//           <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-6 py-5 text-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                   <Plane className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="font-bold text-lg leading-none">{booking.airline}</p>
//                   <p className="text-blue-300 text-sm">{booking.flightNumber}</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs text-blue-300 uppercase tracking-wider">Billet électronique</p>
//                 <p className="text-sm font-semibold">{booking.ref}</p>
//               </div>
//             </div>
//           </div>

//           <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-4xl font-black text-gray-900 tracking-tight">{booking.origin}</p>
//                 <p className="text-lg font-semibold text-gray-700">{booking.departureTime}</p>
//                 <p className="text-sm text-gray-500">{originAirport?.city}</p>
//               </div>

//               <div className="flex flex-col items-center gap-1 text-gray-400">
//                 <p className="text-xs">{booking.duration}</p>
//                 <div className="flex items-center gap-1">
//                   <div className="w-8 h-px bg-gray-400" />
//                   <Plane className="w-4 h-4 text-blue-500 rotate-90" />
//                   <div className="w-8 h-px bg-gray-400" />
//                 </div>
//                 <p className="text-xs">Direct</p>
//               </div>

//               <div className="text-right">
//                 <p className="text-4xl font-black text-gray-900 tracking-tight">{booking.destination}</p>
//                 <p className="text-lg font-semibold text-gray-700">{booking.arrivalTime}</p>
//                 <p className="text-sm text-gray-500">{destAirport?.city}</p>
//               </div>
//             </div>
//           </div>

//           <div className="relative flex items-center px-0">
//             <div className="absolute -left-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
//             <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-6" />
//             <div className="absolute -right-3 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
//           </div>

//           <div className="px-6 py-5 flex items-start justify-between gap-4">
//             <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Passager</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.passengerName.toUpperCase()}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Siège</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.seat}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">
//                   {dep.toLocaleDateString("fr-FR", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                   }).toUpperCase()}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Porte</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.gate}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Classe</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.cabinClass}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Paiement</p>
//                 <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.payMethod}</p>
//               </div>
//             </div>

//             <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
//               <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
//                 <FakeQR value={booking.ref} />
//               </div>
//               <p className="text-[10px] text-gray-400 font-mono">{booking.ref}</p>
//             </div>
//           </div>

//           <div className="px-6 pb-5 flex flex-col items-center gap-1">
//             <Barcode value={booking.ref} />
//             <p className="font-mono text-[10px] text-gray-400 tracking-widest">
//               {booking.ref.replace("SKY-", "").split("").join(" · ")}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">
//           <Wifi className="w-4 h-4 flex-shrink-0" />
//           <span>
//             Ce billet a été envoyé à <strong>{currentUser.email}</strong>. Présentez-le à l'aéroport (QR code ou référence).
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <button
//             onClick={() => navigate("/dashboard?tab=trips")}
//             className="py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
//           >
//             <Plane className="w-4 h-4" /> Mes voyages
//           </button>
//           <button
//             className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
//             onClick={() => {
//               const el = document.getElementById("ticket-print");
//               if (el) window.print();
//             }}
//           >
//             <Download className="w-4 h-4" /> Télécharger
//           </button>
//         </div>

//         <button
//           onClick={() => navigate("/")}
//           className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center gap-1"
//         >
//           <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header showBackButton />
//       <div className="max-w-2xl mx-auto px-4 py-8">
//         <ProgressBar current={step} />
//         {step === "review" && <StepReview />}
//         {step === "payment" && <StepPayment />}
//         {step === "ticket" && <StepTicket />}
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { Header } from "../composants/shared/Headerr";
// import { Footer } from "../composants/shared/Footer";
// import { ProgressBar } from "../composants/UI/ProgressBar";
// import { LoginPage } from "./LoginPage";
// import { Lock } from "lucide-react";

// // Composants sortis du composant principal
// function StepReview({ booking, onNext }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Revue de la réservation</h2>

//       <div className="space-y-3 text-gray-700">
//         <p><strong>Vol :</strong> {booking.flightNumber}</p>
//         <p><strong>Compagnie :</strong> {booking.airline}</p>
//         <p><strong>Départ :</strong> {booking.origin}</p>
//         <p><strong>Destination :</strong> {booking.destination}</p>
//         <p><strong>Date :</strong> {booking.date}</p>
//       </div>

//       <button
//         onClick={onNext}
//         className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//       >
//         Continuer
//       </button>
//     </div>
//   );
// }

// function StepPayment({ booking, onBack, onPay }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Paiement</h2>

//       <div className="space-y-3 text-gray-700">
//         <p><strong>Total :</strong> {booking.price}€</p>
//         <p>Choisis ton moyen de paiement.</p>
//       </div>

//       <div className="flex gap-3 mt-6">
//         <button
//           onClick={onBack}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//         >
//           Retour
//         </button>
//         <button
//           onClick={onPay}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//         >
//           Payer maintenant
//         </button>
//       </div>
//     </div>
//   );
// }

// function StepTicket({ booking }) {
//   if (!booking) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//       <h2 className="text-xl font-bold mb-4">Billet confirmé</h2>
//       <p className="text-gray-700">
//         Votre réservation pour le vol {booking.flightNumber} est confirmée.
//       </p>
//     </div>
//   );
// }

// export function Checkout() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [showLogin, setShowLogin] = useState(false);

//   const origin = searchParams.get("origin") || "CDG";
//   const destination = searchParams.get("destination") || "JFK";
//   const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
//   const passengers = searchParams.get("passengers") || "1";
//   const tripType = searchParams.get("tripType") || "round-trip";

//   const [step, setStep] = useState("review");

//   const booking = {
//     flightNumber: id,
//     airline: "Compagnie exemple",
//     origin,
//     destination,
//     date,
//     passengers,
//     tripType,
//     price: 450,
//   };

//   function handleBook() {
//     const user = localStorage.getItem("currentUser");

//     if (!user) {
//       setShowLogin(true);
//       return;
//     }

//     navigate(
//       `/checkout?flightId=${id}&origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}&tripType=${tripType}`
//     );
//   }

//   function handleNextStep() {
//     setStep("payment");
//   }

//   function handlePay() {
//     setStep("ticket");
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header showBackButton />
//       <div className="max-w-2xl mx-auto px-4 py-8">
//         <ProgressBar current={step} />

//         {step === "review" && (
//           <StepReview booking={booking} onNext={handleNextStep} />
//         )}

//         {step === "payment" && (
//           <StepPayment
//             booking={booking}
//             onBack={() => setStep("review")}
//             onPay={handlePay}
//           />
//         )}

//         {step === "ticket" && <StepTicket booking={booking} />}

//         <button
//           onClick={handleBook}
//           className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
//         >
//           <Lock className="w-5 h-5" /> Réserver ce vol
//         </button>
//       </div>

//       <Footer />

//       {showLogin && (
//         <LoginPage
//           onClose={() => setShowLogin(false)}
//           onSuccess={() => {
//             setShowLogin(false);
//             navigate(
//               `/checkout?flightId=${id}&origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}&tripType=${tripType}`
//             );
//           }}
//         />
//       )}
//     </div>
//   );
// }
