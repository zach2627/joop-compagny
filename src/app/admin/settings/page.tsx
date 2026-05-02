import Link from "next/link";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Package,
  ExternalLink,
  Info,
  KeyRound,
} from "lucide-react";

export const metadata = { title: "Parametres" };

const panel: React.CSSProperties = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between py-3 last:border-0"
      style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
    >
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.46)" }}>{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group"
      style={{
        border: "1px solid rgba(201,168,76,0.14)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.16)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
      </div>
      <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Parametres</h1>
        <p className="mt-1" style={{ color: "rgba(255,255,255,0.46)" }}>
          Configuration et informations du site
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6" style={panel}>
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4" style={{ color: "#C9A84C" }} />
            <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
              Informations du site
            </h2>
          </div>
          <div>
            <InfoRow label="Nom du site" value={siteConfig.name} />
            <InfoRow label="URL" value={seoConfig.siteUrl} />
            <InfoRow label="Langue" value="Francais / Anglais" />
            <InfoRow label="Devise" value="Franc CFA (XOF)" />
            <InfoRow label="Fuseau horaire" value="Africa/Dakar (UTC+0)" />
          </div>
        </div>

        <div className="p-6" style={panel}>
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-4 h-4" style={{ color: "#C9A84C" }} />
            <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
              Coordonnees
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.14)" }}
              >
                <MapPin className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Adresse</p>
                <p className="text-sm font-medium text-white">{siteConfig.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.14)" }}
              >
                <Mail className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Email</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#C9A84C" }}
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.14)" }}
              >
                <Phone className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Telephone</p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#C9A84C" }}
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6" style={panel}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
          Gestion du contenu
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickLink
            href="/admin/banners"
            icon={ImageIcon}
            label="Bannieres"
            desc="Gerer les visuels de mise en avant"
          />
          <QuickLink
            href="/admin/produits"
            icon={Package}
            label="Produits"
            desc="Ajouter, modifier ou supprimer des produits"
          />
          <QuickLink
            href="/admin/settings/password"
            icon={KeyRound}
            label="Securite"
            desc="Changer le mot de passe de votre compte admin"
          />
          <QuickLink
            href="/admin/analytics"
            icon={Globe}
            label="Analytiques"
            desc="Suivre les ventes et les performances"
          />
          <QuickLink
            href="/"
            icon={ExternalLink}
            label="Voir le site"
            desc="Ouvrir la boutique en ligne"
          />
        </div>
      </div>

      <div className="p-6" style={panel}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
          Informations techniques
        </h2>
        <div>
          <InfoRow label="Framework" value="Next.js 14 (App Router)" />
          <InfoRow label="Base de donnees" value="PostgreSQL + Prisma ORM" />
          <InfoRow label="Paiement" value="PayDunya (Wave, Orange Money)" />
          <InfoRow label="Images" value="Visuels locaux + Cloudinary optionnel" />
          <InfoRow label="Hebergement" value="Vercel" />
        </div>
      </div>
    </div>
  );
}
