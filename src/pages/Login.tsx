import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthError } from '@supabase/supabase-js';

const Login = () => {
  const { session } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let authError: AuthError | null = null;

    if (mode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    } else if (mode === 'signUp') {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    } else if (mode === 'forgotPassword') {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      authError = error;
      if (!error) {
        setSuccessMessage("Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.");
      }
    }

    if (authError) {
      setError(authError.message);
    } else if (mode === 'signUp') {
      setSuccessMessage('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.');
    }
    setLoading(false);
  };

  if (session) {
    return <Navigate to="/" replace />;
  }

  const getButtonText = () => {
    if (loading) return <Loader2 className="w-6 h-6 animate-spin" />;
    if (mode === 'signIn') return 'Se connecter';
    if (mode === 'signUp') return "S'inscrire";
    return "Envoyer le lien de réinitialisation";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#FFDDC1] to-[#FFD4B2]">
      <div className="w-full max-w-md text-center">
        <div className="mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-[#4A5FE8] tracking-tighter">Hachieve</h1>
          <p className="text-2xl md:text-3xl text-[#4A5FE8] font-light tracking-tight">8 paths to achievement</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleAuthAction}>
          {error && (
            <Alert variant="destructive" className="text-left">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
             <Alert className="text-left">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <div className="relative w-full">
            <input
              type="email"
              placeholder="Adresse mail"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 text-base border-none rounded-2xl bg-[#FFF4E6] shadow-sm transition-all duration-300 ease-in-out outline-none focus:bg-white focus:shadow-lg focus:shadow-[#4a5fe8]/15 placeholder:text-[#8B7355] placeholder:font-normal"
            />
          </div>

          {mode !== 'forgotPassword' && (
            <div className="relative w-full">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Mot de passe"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 text-base border-none rounded-2xl bg-[#FFF4E6] shadow-sm transition-all duration-300 ease-in-out outline-none focus:bg-white focus:shadow-lg focus:shadow-[#4a5fe8]/15 placeholder:text-[#8B7355] placeholder:font-normal"
              />
              <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 p-1" onClick={() => setPasswordVisible(!passwordVisible)}>
                {passwordVisible ? (
                  <EyeOff className="w-6 h-6 text-[#8B7355]" />
                ) : (
                  <Eye className="w-6 h-6 text-[#8B7355]" />
                )}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2.5 text-lg font-semibold text-white bg-gradient-to-br from-[#FFB366] to-[#FFA34D] rounded-full cursor-pointer transition-all duration-300 ease-in-out shadow-[0_4px_15px_rgba(255,163,77,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,163,77,0.4)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {getButtonText()}
          </button>
        </form>

        <div className="mt-9 flex flex-col gap-4">
          <button
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              if (mode === 'forgotPassword') {
                setMode('signIn');
              } else {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              }
            }}
            className="text-[#4A5FE8] text-base transition-opacity duration-300 hover:opacity-70 hover:underline"
          >
            {mode === 'signIn'
              ? "Vous n'avez pas de compte ? Inscrivez-vous"
              : mode === 'signUp'
              ? "Vous avez déjà un compte ? Connectez-vous"
              : "Retour à la connexion"}
          </button>
          {mode === 'signIn' && (
            <button
              onClick={() => {
                setMode('forgotPassword');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[#4A5FE8] text-base transition-opacity duration-300 hover:opacity-70 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;