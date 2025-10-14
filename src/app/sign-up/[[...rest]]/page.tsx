import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="h-screen bg-background flex">
      {/* Lado esquerdo - Formulário de cadastro */}
      <div className="flex-1 flex flex-col justify-start p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex-shrink-0">
          {/* Logo - Sempre visível */}
          <div className="flex justify-center mb-4 pt-4">
            <Image
              src="/ZARIFE_LOGO.png"
              alt="Zarife"
              width={120}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          {/* Título e Descrição */}
          <div className="text-center mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-playfair mb-3">
              Junte-se à Zarife
            </h1>
            <p className="text-muted-foreground">
              Registe-se e tenha acesso a ofertas exclusivas
            </p>
          </div>

          {/* Componente de Sign Up */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors duration-200",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border-border hover:bg-accent/50 text-foreground py-2.5",
                  formFieldInput: "border-border bg-input text-foreground placeholder:text-muted-foreground py-2.5",
                  formFieldLabel: "text-foreground font-medium",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  identityPreviewEditButton: "text-primary hover:text-primary/80",
                  formResendCodeLink: "text-primary hover:text-primary/80",
                  otpCodeFieldInput: "border-border py-2.5",
                  formFieldRow: "mb-4",
                  rootBox: "w-full",
                }
              }}
            />
          </div>

          {/* Link adicional */}
          <div className="text-center pb-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium">
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Imagem/Banner */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40">
          <Image
            src="/banner.jpg"
            alt="Zarife Fashion"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h3 className="text-3xl lg:text-4xl font-bold mb-3 font-playfair">
                Bem-vinda à Zarife
              </h3>
              <p className="text-lg lg:text-xl text-white/90 max-w-md">
                Registe-se e seja a primeira a saber sobre lançamentos, saldos e tendências exclusivas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
