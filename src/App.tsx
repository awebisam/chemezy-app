function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            {import.meta.env.VITE_APP_NAME || 'Chemezy'}
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive Virtual Chemistry Laboratory
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Your Virtual Chemistry Lab
            </h2>
            <p className="text-gray-600 mb-6">
              Experiment with chemical reactions in a safe, interactive
              environment. Mix chemicals, observe visual effects, and discover
              new compounds!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-primary-700 mb-2">
                  Safe Experimentation
                </h3>
                <p className="text-sm text-gray-600">
                  Explore dangerous reactions without any physical risk
                </p>
              </div>

              <div className="p-6 bg-secondary-50 rounded-lg">
                <h3 className="font-semibold text-secondary-700 mb-2">
                  Visual Effects
                </h3>
                <p className="text-sm text-gray-600">
                  Watch reactions come to life with dynamic visual feedback
                </p>
              </div>

              <div className="p-6 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">
                  Track Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Earn awards and compete on leaderboards
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button className="btn-primary mr-4">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
