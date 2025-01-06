import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-green-600 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agrotour</h1>
          <div className="space-x-4">
            <Link
              to="/"
              className="hover:bg-green-700 px-4 py-2 rounded transition-colors"
              aria-label="Ir al inicio"
            >
              Inicio
            </Link>
            <Link
              to="/login"
              className="hover:bg-green-700 px-4 py-2 rounded transition-colors"
              aria-label="Ir a la página de inicio de sesión"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="hover:bg-green-700 px-4 py-2 rounded transition-colors"
              aria-label="Ir a la página de registro"
            >
              Registro
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-green-500 text-white text-center py-16">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">Conecta con la Naturaleza</h1>
          <p className="text-lg mb-8">
            Explora lo mejor del comercio y turismo rural de tu región. Productos frescos, experiencias únicas, y mucho más.
          </p>
          <Link
            to="/paginaexploraproducto"
            className="bg-amber-300 hover:bg-amber-400 text-green-700 font-bold py-2 px-4 rounded transition-colors"
            aria-label="Explorar la plataforma"
          >
            Explorar Ahora
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-8">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Economía Local",
                description: "Promovemos la economía local apoyando a los productores locales y negocios rurales.",
              },
              {
                title: "Experiencias Únicas",
                description: "Disfruta de turismo rural con actividades auténticas e inmersivas.",
              },
              {
                title: "Productos Frescos",
                description: "Encuentra productos agrícolas directamente de los productores locales.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-sky-100 p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 text-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¡Únete a Nosotros!</h2>
          <p className="text-lg mb-8">
            Regístrate hoy y forma parte de nuestra comunidad de productores, compradores y turistas.
          </p>
          <Link
            to="/register"
            className="bg-amber-300 hover:bg-amber-400 text-green-700 font-bold py-2 px-4 rounded transition-colors"
            aria-label="Regístrate ahora"
          >
            Regístrate Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 text-center">
        <p>2023 Agrotour. Todos los derechos reservados.</p>
        <div className="mt-2 space-x-4">
          {[
            { href: "#", label: "Contacto" },
            { href: "#", label: "Redes Sociales" },
          ].map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="hover:text-white transition-colors"
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
