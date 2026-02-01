"""
Utilidades para enviar emails de verificación.
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_verification_email(user_email: str, verification_token: str, user_name: str) -> bool:
    """
    Enviar email de verificación al usuario.
    
    Args:
        user_email: Email del usuario
        verification_token: Token único para verificar
        user_name: Nombre del usuario (para personalización)
    
    Returns:
        True si se envió correctamente, False en caso contrario
    """
    
    # URL del link de verificación (ajusta según tu frontend)
    verification_url = f"http://localhost:4200/auth/verify?token={verification_token}"
    
    # Contexto para el email HTML
    context = {
        'user_name': user_name,
        'verification_url': verification_url,
        'token': verification_token,
    }
    
    # Asunto del email
    subject = '¡Verifica tu email en Qubby!'
    
    # Cuerpo del email en texto plano (fallback)
    message = f"""
Hola {user_name},

Gracias por registrarte en Qubby. Para activar tu cuenta, 
haz click en el siguiente enlace:

{verification_url}

Si no hiciste esta solicitud, ignora este email.

Saludos,
El equipo de Qubby
    """
    
    # Cuerpo del email en HTML (si quieres personalización)
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h2>¡Bienvenido a Qubby, {user_name}!</h2>
                
                <p>Gracias por registrarte. Para activar tu cuenta, haz click en el botón de abajo:</p>
                
                <a href="{verification_url}" 
                   style="display: inline-block; padding: 12px 24px; 
                           background-color: #007bff; color: white; 
                           text-decoration: none; border-radius: 4px;
                           margin: 20px 0;">
                    Verificar Email
                </a>
                
                <p>O copia este enlace en tu navegador:</p>
                <p><code>{verification_url}</code></p>
                
                <hr>
                <p style="color: #666; font-size: 12px;">
                    Si no hiciste esta solicitud, ignora este email.
                </p>
            </div>
        </body>
    </html>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False
