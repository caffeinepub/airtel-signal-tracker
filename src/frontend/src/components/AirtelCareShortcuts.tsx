import { MessageCircle, Phone, PhoneCall } from "lucide-react";

export function AirtelCareShortcuts() {
  return (
    <div className="bg-card rounded-xl border border-border shadow p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <PhoneCall className="w-5 h-5 text-destructive" />
        <h3 className="font-bold text-foreground text-sm">
          Airtel Customer Care
        </h3>
      </div>

      <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        📞 <strong>100</strong> and <strong>111</strong> are free calls from any
        Airtel number
      </p>

      <div className="grid grid-cols-3 gap-2">
        {/* Call 100 */}
        <a
          href="tel:100"
          data-ocid="safety.care.primary_button"
          className="flex flex-col items-center gap-1.5 bg-destructive text-white rounded-xl py-4 px-2 active:scale-95 transition-transform shadow-md"
        >
          <Phone className="w-6 h-6" />
          <span className="font-bold text-base leading-none">100</span>
          <span className="text-[9px] opacity-80 text-center leading-tight">
            Airtel Free Care
          </span>
        </a>

        {/* Call 111 */}
        <a
          href="tel:111"
          data-ocid="safety.care.secondary_button"
          className="flex flex-col items-center gap-1.5 bg-destructive text-white rounded-xl py-4 px-2 active:scale-95 transition-transform shadow-md"
        >
          <Phone className="w-6 h-6" />
          <span className="font-bold text-base leading-none">111</span>
          <span className="text-[9px] opacity-80 text-center leading-tight">
            Airtel Uganda
          </span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/256800100100"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="safety.care.whatsapp.button"
          className="flex flex-col items-center gap-1.5 bg-[#25D366] text-white rounded-xl py-4 px-2 active:scale-95 transition-transform shadow-md"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold text-sm leading-none">WA</span>
          <span className="text-[9px] opacity-80 text-center leading-tight">
            Support Chat
          </span>
        </a>
      </div>

      <div className="text-[10px] text-muted-foreground space-y-0.5">
        <p>
          • Call <strong>100</strong> for general Airtel support
        </p>
        <p>
          • Call <strong>111</strong> for Airtel Uganda network issues
        </p>
        <p>• WhatsApp: +256 800 100 100</p>
      </div>
    </div>
  );
}
