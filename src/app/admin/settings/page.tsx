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
} from "lucide-react";

export const metadata = { title: "Parametres" };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-apple-gray-100 last:border-0">
      <span className="text-sm text-apple-gray-500">{label}</span>
      <span className="text-sm font-medium text-apple-gray-900">{value}</span>
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
      className="flex items-center gap-4 p-4 rounded-apple-md border border-apple-gray-200
                 hover:border-apple-gray-300 hover:bg-apple-gray-50 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-apple-md bg-apple-gray-100 flex items-center justify-center shrink-0 group-hover:bg-apple-gray-200 transition-colors">
        <Icon className="w-5 h-5 text-apple-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-apple-gray-900">{label}</p>
        <p className="text-xs text-apple-gray-500 mt-0.5">{desc}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-apple-gray-300 group-hover:text-apple-gray-500 transition-colors shrink-0" />
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-display-sm text-apple-gray-900">Parametres</h1>
        <p className="text-apple-gray-500 mt-1">Configuration et informations du site</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-apple-gray-400" />
            <h2 className="text-sm font-semibold text-apple-gray-900">Informations du site</h2>
          </div>
          <div>
            <InfoRow label="Nom du site" value={siteConfig.name} />
            <InfoRow label="URL" value={seoConfig.siteUrl} />
            <InfoRow label="Langue" value="Francais / Anglais" />
            <InfoRow label="Devise" value="Franc CFA (XOF)" />
            <InfoRow label="Fuseau horaire" value="Africa/Dakar (UTC+0)" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-4 h-4 text-apple-gray-400" />
            <h2 className="text-sm font-semibold text-apple-gray-900">Coordonnees</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-apple-gray-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-apple-gray-500" />
              </div>
              <div>
                <p className="text-xs text-apple-gray-400">Adresse</p>
                <p className="text-sm font-medium text-apple-gray-900">{siteConfig.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-apple-gray-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-apple-gray-500" />
              </div>
              <div>
                <p className="text-xs text-apple-gray-400">Email</p>
                <a href={`mailto:${siteConfig.email}`} className="text-sm font-medium text-apple-blue hover:underline">
                  {siteConfig.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-apple-md bg-apple-gray-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-apple-gray-500" />
              </div>
              <div>
                <p className="text-xs text-apple-gray-400">Telephone</p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-sm font-medium text-apple-blue hover:underline"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-apple-gray-900 mb-4">Gestion du contenu</h2>
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

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-apple-gray-900 mb-4">Informations techniques</h2>
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
