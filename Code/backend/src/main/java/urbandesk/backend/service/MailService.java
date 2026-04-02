package urbandesk.backend.service;

import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.incidence.Estado;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    private void enviar(String destinatario, String asunto, String cuerpoHtml) {
        try {
            if (destinatario.contains("@urbandesk.com")) {
                System.out.println("Email no enviado a " + destinatario + ": usuario interno");
                return;
            }
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML
            mailSender.send(mensaje);
        } catch (Exception e) {
            System.err.println("Error al enviar email a " + destinatario + ": " + e.getMessage());
        }
    }

    public void enviarBienvenida(String destinatario, String nombre, String email) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">

                    <!-- Cuerpo -->
                    <div style="padding: 32px 32px 16px 32px;">
                        <p style="font-size: 15px; line-height: 1.6;">
                            ¡Bienvenido/a a UrbanDesk! Tu cuenta ha sido creada correctamente.
                            Ya puedes acceder a la plataforma y empezar a colaborar en la mejora de la ciudad.
                        </p>
                        <p style="font-size: 15px; line-height: 1.6;">
                            Si tienes cualquier duda, puedes responder a este correo.
                        </p>
                    </div>

                    <!-- Tarjeta datos de acceso -->
                    <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                                border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 12px;
                                   font-weight: bold; color: #555; letter-spacing: 0.5px;">
                            TUS DATOS DE ACCESO:
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Email: </em>
                            <a href="mailto:%s" style="color: #1e3a8a; text-decoration: none;">%s</a>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 1px solid #e5e7eb; padding: 24px 32px;
                                display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">
                                UrbanDesk
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 11px;
                                       color: #6b7280; letter-spacing: 1px;">
                                GESTIÓN DE INCIDENCIAS URBANAS
                            </p>
                        </div>
                        <div style="text-align: right; font-size: 13px; color: #4b5563;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com"
                                   style="color: #1e3a8a; text-decoration: none;">
                                    urbandesk@javimoralesg.com
                                </a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </div>
                    </div>

                </div>
                """.formatted(email, email);

        enviar(destinatario, "Bienvenido/a a UrbanDesk", html);
    }

    public void enviarIncidenciaCreada(String destinatario, Long idIncidencia, String titulo) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">UrbanDesk</h1>
                    </div>
                    <div style="padding: 32px; background-color: #f9fafb;">
                        <h2 style="color: #1f2937;">Incidencia registrada</h2>
                        <p style="color: #4b5563;">Tu incidencia ha sido creada correctamente.</p>
                        <div style="background-color: white; border-left: 4px solid #3b82f6;
                                    padding: 16px; margin: 16px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #6b7280;">Nº incidencia: <strong>#%d</strong></p>
                            <p style="margin: 8px 0 0; color: #6b7280;">Título: <strong>%s</strong></p>
                        </div>
                        <p style="color: #4b5563;">Nos pondremos en contacto contigo pronto.</p>
                    </div>
                    <div style="padding: 16px; background-color: #e5e7eb; text-align: center;">
                        <p style="color: #6b7280; font-size: 12px;">© 2026 UrbanDesk. Todos los derechos reservados.</p>
                    </div>
                </div>
                """.formatted(idIncidencia, titulo);

        enviar(destinatario, "Incidencia #" + idIncidencia + " creada", html);
    }

    public void enviarCambioEstado(String destinatario, Long idIncidencia,
            String titulo, Estado nuevoEstado) {

        if (nuevoEstado != Estado.VALIDADA && nuevoEstado != Estado.RESUELTA && nuevoEstado != Estado.RECHAZADA) {
            return;
        }
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">UrbanDesk</h1>
                    </div>
                    <div style="padding: 32px; background-color: #f9fafb;">
                        <h2 style="color: #1f2937;">Estado actualizado</h2>
                        <div style="background-color: white; border-left: 4px solid #f59e0b;
                                    padding: 16px; margin: 16px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #6b7280;">Nº incidencia: <strong>#%d</strong></p>
                            <p style="margin: 8px 0 0; color: #6b7280;">Título: <strong>%s</strong></p>
                            <p style="margin: 8px 0 0; color: #6b7280;">Nuevo estado: <strong>%s</strong></p>
                        </div>
                    </div>
                    <div style="padding: 16px; background-color: #e5e7eb; text-align: center;">
                        <p style="color: #6b7280; font-size: 12px;">© 2026 UrbanDesk. Todos los derechos reservados.</p>
                    </div>
                </div>
                """.formatted(idIncidencia, titulo, nuevoEstado.name());

        enviar(destinatario, "Incidencia #" + idIncidencia + " actualizada", html);
    }

    public void enviarIncidenciaResuelta(String destinatario, Long idIncidencia, String titulo) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <div style="background-color: #22c55e; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">UrbanDesk</h1>
                    </div>
                    <div style="padding: 32px; background-color: #f9fafb;">
                        <h2 style="color: #1f2937;">Incidencia resuelta ✓</h2>
                        <div style="background-color: white; border-left: 4px solid #22c55e;
                                    padding: 16px; margin: 16px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #6b7280;">Nº incidencia: <strong>#%d</strong></p>
                            <p style="margin: 8px 0 0; color: #6b7280;">Título: <strong>%s</strong></p>
                        </div>
                        <p style="color: #4b5563;">Por favor valídala si estás de acuerdo con la resolución.</p>
                    </div>
                    <div style="padding: 16px; background-color: #e5e7eb; text-align: center;">
                        <p style="color: #6b7280; font-size: 12px;">© 2026 UrbanDesk. Todos los derechos reservados.</p>
                    </div>
                </div>
                """.formatted(idIncidencia, titulo);

        enviar(destinatario, "Incidencia #" + idIncidencia + " resuelta", html);
    }
}