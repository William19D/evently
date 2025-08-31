import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MfaDebug = () => {
  const { user, isMfaEnabled, checkMfaStatus } = useAuth();

  const testMfaStatus = async () => {
    try {
      console.log('Current user:', user);
      console.log('MFA enabled state:', isMfaEnabled);
      
      const { data, error } = await supabase.auth.mfa.listFactors();
      console.log('MFA factors:', data);
      console.log('MFA error:', error);
      
      const status = await checkMfaStatus();
      console.log('Checked MFA status:', status);
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  const testEnrollment = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Test Factor'
      });
      console.log('Enrollment test:', { data, error });
    } catch (error) {
      console.error('Enrollment test error:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">MFA Debug Panel</CardTitle>
        <CardDescription className="text-xs">Panel de depuración temporal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button size="sm" onClick={testMfaStatus} className="w-full">
          Check MFA Status
        </Button>
        <Button size="sm" onClick={testEnrollment} className="w-full" variant="outline">
          Test Enrollment
        </Button>
        <div className="text-xs">
          <p>User: {user.email}</p>
          <p>MFA: {isMfaEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MfaDebug;
