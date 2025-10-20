// userService.ts
// Eliminación de cuenta con Supabase Edge Function

import { supabase } from '@/integrations/supabase/client';

interface DeleteUserResponse {
  success: boolean;
  message: string;
  deletedItems?: {
    reservations: number;
    payments: number;
    reservationServices: number;
    spaces: number;
    additionalServices: number;
    spacePhotos: number;
    spaceAmenities: number;
    spaceReviews: number;
    favorites: number;
    authTokens: number;
    mfaSettings: number;
    authRoles: number;
    usersRoles: number;
  };
  error?: string;
}

/**
 * Elimina toda la información del usuario de forma permanente
 * Esta acción NO se puede deshacer
 * 
 * @param userId - ID del usuario a eliminar
 * @returns Promise con el resultado de la eliminación
 */
export const deleteUserAccount = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    console.log('🔍 Deleting user account:', {
      userId: userId.substring(0, 8) + '***',
      timestamp: new Date().toISOString()
    });

    // Llamar a la Edge Function con el userId
    const { data, error } = await supabase.functions.invoke('user-soft-delete', {
      method: 'POST',
      body: {
        userId: userId
      },
    });

    if (error) {
      console.error('❌ Error al invocar función:', error);
      throw new Error(error.message || 'Error al comunicarse con el servidor');
    }

    console.log('✅ Function response:', data);

    // Si la eliminación fue exitosa, limpiar el almacenamiento local
    if (data?.success) {
      // Limpiar tokens y datos de autenticación locales
      localStorage.removeItem('evently_access_token');
      localStorage.removeItem('evently_refresh_token');
      sessionStorage.clear();
      
      // Cerrar sesión en Supabase también
      await supabase.auth.signOut();
    }

    return data as DeleteUserResponse;
  } catch (error: any) {
    console.error('❌ Error al eliminar cuenta:', error);

    return {
      success: false,
      message: 'Error al eliminar la cuenta',
      error: error.message || 'Error desconocido',
    };
  }
};