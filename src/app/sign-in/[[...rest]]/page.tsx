import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="h-screen bg-background flex">
      {/* Lado esquerdo - Formulário de login */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo e Header - Sempre visível */}
          <div className="text-center space-y-4">
            <div>
              <Image
                src="/ZARIFE_LOGO.png"
                alt="Zarife"
                width={100}
                height={50}
                className="mx-auto"
                priority
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground font-playfair">
                Bem-vinda de volta
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Entre na sua conta para acessar todas as funcionalidades da Zarife
              </p>
            </div>
          </div>

          {/* Componente de Sign In */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors duration-200",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border-border hover:bg-accent/50 text-foreground",
                  formFieldInput: "border-border bg-input text-foreground placeholder:text-muted-foreground",
                  formFieldLabel: "text-foreground font-medium",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  identityPreviewEditButton: "text-primary hover:text-primary/80",
                  formResendCodeLink: "text-primary hover:text-primary/80",
                  otpCodeFieldInput: "border-border",
                  rootBox: "w-full",
                }
              }}
            />
          </div>

          {/* Link adicional */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
                Registe-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Imagem/Banner */}
      <div className="hidden lg:block relative w-0 flex-1">
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
                Descubra seu estilo único
              </h3>
              <p className="text-lg lg:text-xl text-white/90 max-w-md">
                Encontre as peças perfeitas para expressar sua personalidade com elegância e sofisticação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
