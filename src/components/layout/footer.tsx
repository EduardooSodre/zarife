import Link from "next/link";
import {
  Instagram
} from "lucide-react";

export function Footer() {

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-gray-800">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light mb-4 tracking-wider uppercase">
              VISITE A ZARIFE
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Centro Comercial do Nortada da Aroeira | Av. Pinhal da Aroeira, 2820-567, Portugal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest">TROCA SIMPLIFICADA</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest">SATISFAÇÃO GARANTIDA</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest">SUPORTE AO CLIENTE</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest">PAGAMENTO SEGURO</h4>
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider">ABOUT OUR STORE</h4>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Use this text area to tell your customers about your brand and vision. You can change it in the theme editor.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider">ASSINE NOSSA NEWSLETTER</h4>
              <p className="text-gray-400 mb-6 text-sm">
                Fique por dentro das últimas tendências e novidades.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
                />
                <button className="w-full bg-gray-700 text-white px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-600 transition-colors">
                  ASSINAR
                </button>
              </div>
            </div>

            {/* Menu Principal */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider">MENU PRINCIPAL</h4>
              <ul className="space-y-3">
                {[
                  { name: "Roupas", href: "/roupas" },
                  { name: "Looks Completos", href: "/looks-completos" },
                  { name: "Conjuntos", href: "/conjuntos" },
                  { name: "Vestidos", href: "/vestidos" },
                  { name: "Moda Praia", href: "/moda-praia" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider">AJUDA</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-blue-400 mr-3">WhatsApp</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-3">E-mail</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-400 mr-3">Instagram</span>
                </div>
                <Link href="/contactos" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contactos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Instagram className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Zarife. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
