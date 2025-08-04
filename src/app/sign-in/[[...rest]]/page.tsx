import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Faça login em sua conta
          </h2>
          <p className="text-gray-600">
            Entre na sua conta para acessar todas as funcionalidades da Zarife
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
