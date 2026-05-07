package urbandesk.backend.service;

import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Ubicacion;

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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

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
                    <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                            </td>
                            <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                                <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0;">
                                    <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                                </p>
                                <p style="margin: 4px 0 0 0;">Madrid, España</p>
                            </td>
                        </tr>
                    </table>

                </div>
                """.formatted(email, email);

        enviar(destinatario, "Bienvenido/a a UrbanDesk", html);
    }

    public void enviarIncidenciaCreada(String destinatario, Long idIncidencia, String titulo) {
       String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Cuerpo -->
                <div style="padding: 32px 32px 16px 32px;">
                    <p style="font-size: 15px; line-height: 1.6;">
                        ¡Tu incidencia ha sido registrada con éxito! A partir de ahora, podrás gestionar tus reportes de manera eficiente y mantenerte informado/a sobre su estado.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Si tienes cualquier duda, puedes responder a este correo.
                    </p>
                </div>

                <!-- Tarjeta datos de la incidencia -->
                <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                            border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #1e3a8a;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Estado: </em>
                        <strong style="color: #1e3a8a;">CREADA</strong>
                    </p>
                </div>

                <!-- Footer -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </td>
                    </tr>
                </table>
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Cuerpo -->
                <div style="padding: 32px 32px 16px 32px;">
                    <p style="font-size: 15px; line-height: 1.6;">
                        ¡Tu incidencia ha sido actualizada por parte del sistema! A partir de ahora, podrás gestionar tus reportes de manera eficiente y mantenerte informado/a sobre su estado.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Si tienes cualquier duda, puedes responder a este correo.
                    </p>
                </div>

                <!-- Tarjeta datos de la incidencia -->
                <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                            border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #1e3a8a;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Estado: </em>
                        <strong style="color: #1e3a8a;">%s</strong>
                    </p>
                </div>

                <!-- Footer -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </td>
                    </tr>
                </table>
            </div>
                """.formatted(idIncidencia, titulo, nuevoEstado.name());

        enviar(destinatario, "Incidencia #" + idIncidencia + " actualizada", html);
    }

    public void enviarIncidenciaResuelta(String destinatario, Long idIncidencia, String titulo) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Cuerpo -->
                <div style="padding: 32px 32px 16px 32px;">
                    <p style="font-size: 15px; line-height: 1.6;">
                        ¡Tu incidencia ha sido resuelta! Muchas gracias por confiar en UrbanDesk.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Si tienes cualquier duda, puedes responder a este correo.
                    </p>
                </div>

                <!-- Tarjeta datos de la incidencia -->
                <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                            border-left: 4px solid #2f855a; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #2f855a;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Estado: </em>
                        <strong style="color: #2f855a;">RESUELTA</strong>
                    </p>
                </div>

                <!-- Footer -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </td>
                    </tr>
                </table>
            </div>
                """.formatted(idIncidencia, titulo);

        enviar(destinatario, "Incidencia #" + idIncidencia + " resuelta", html);
    }

    public void enviarIncidenciaAsignadaOperador(String destinatario, Long idIncidencia,
        String descripcion, Ubicacion ubicacion) {
    String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Cuerpo -->
                <div style="padding: 32px 32px 16px 32px;">
                    <p style="font-size: 15px; line-height: 1.6;">
                        Te ha asignado una nueva incidencia urbana. Acceda al sistema para continuar con su gestión.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Si tienes cualquier duda, puedes responder a este correo.
                    </p>
                </div>

                <!-- Tarjeta datos de la incidencia -->
                <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                            border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #1e3a8a;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Ubicación: </em>
                        <strong style="color: #1e3a8a;">%s</strong>
                    </p>
                </div>

                <!-- Footer -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </td>
                    </tr>
                </table>
            </div>
            """.formatted(idIncidencia, descripcion, ubicacion.toString());

    enviar(destinatario, "Nueva incidencia asignada #" + idIncidencia, html);
    } 

    public void enviarIncidenciaAsignadaTecnico(String destinatario, Long idIncidencia,
        String descripcion, Ubicacion ubicacion) {
    String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Cuerpo -->
                <div style="padding: 32px 32px 16px 32px;">
                    <p style="font-size: 15px; line-height: 1.6;">
                        Te ha asignado una nueva incidencia urbana. Acceda al sistema para continuar con su gestión.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Si tienes cualquier duda, puedes responder a este correo.
                    </p>
                </div>

                <!-- Tarjeta datos de la incidencia -->
                <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                            border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #1e3a8a;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Ubicación: </em>
                        <strong style="color: #1e3a8a;">%s</strong>
                    </p>
                </div>

                <!-- Footer -->
                <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                            <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                            <p style="margin: 4px 0 0 0;">
                                <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                            </p>
                            <p style="margin: 4px 0 0 0;">Madrid, España</p>
                        </td>
                    </tr>
                </table>
            </div>
            """.formatted(idIncidencia, descripcion, ubicacion.toString());

    enviar(destinatario, "Nueva incidencia asignada #" + idIncidencia, html);
    } 
    
    public void enviarIncidenciaRechazadaPorTecnico(String destinatario, Long idIncidencia,
        String descripcion, String nombreTecnico, String motivo) {
    String html = """
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <div style="padding: 32px 32px 16px 32px;">
                        <p style="font-size: 15px; line-height: 1.6;">
                            El técnico <strong>%s</strong> ha rechazado la incidencia asignada.
                        Es necesario reasignarla a otro técnico disponible.
                        </p>
                        <p style="font-size: 15px; line-height: 1.6;">
                            Si tienes cualquier duda, puedes responder a este correo.
                        </p>
                    </div>

                    <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                                border-left: 4px solid #ef4444; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 12px;
                                font-weight: bold; color: #555; letter-spacing: 0.5px;">
                            DATOS DE LA INCIDENCIA:
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Nº incidencia: </em>
                            <strong style="color: #ef4444;">#%d</strong>
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Descripción: </em>
                            <span>%s</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Técnico: </em>
                            <strong style="color: #ef4444;">%s</strong>
                        </p>
                    </div>

                    <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                            </td>
                            <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                                <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0;">
                                    <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                                </p>
                                <p style="margin: 4px 0 0 0;">Madrid, España</p>
                            </td>
                        </tr>
                    </table>

                </div>
            """.formatted(nombreTecnico, idIncidencia, descripcion, motivo);

    enviar(destinatario, "Incidencia #" + idIncidencia + " rechazada por técnico", html);
    }  

    public void enviarTareaFinalizadaPorTecnico(String destinatario, Long idIncidencia,
        String descripcion, String nombreTecnico, String comentario) {
            String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <div style="padding: 32px 32px 16px 32px;">
                        <p style="font-size: 15px; line-height: 1.6;">
                            El técnico <strong>%s</strong> ha marcado su parte como finalizada.
                            Accede a la plataforma para comprobar si todos los técnicos han
                            concluido y proceder a la validación.
                        </p>
                        <p style="font-size: 15px; line-height: 1.6;">
                            Si tienes cualquier duda, puedes responder a este correo.
                        </p>
                    </div>

                    <div style="margin: 0 32px 32px 32px; padding: 16px 20px;
                                border-left: 4px solid #2f855a; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 12px;
                                font-weight: bold; color: #555; letter-spacing: 0.5px;">
                            DATOS DE LA INCIDENCIA:
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Nº incidencia: </em>
                            <strong style="color: #2f855a;">#%d</strong>
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Descripción: </em>
                            <span>%s</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Técnico: </em>
                            <strong style="color: #2f855a;">%s</strong>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Comentario: </em>
                            <strong style="color: #2f855a;">%s</strong>
                        </p>
                    </div>

                    <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                            </td>
                            <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                                <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0;">
                                    <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                                </p>
                                <p style="margin: 4px 0 0 0;">Madrid, España</p>
                            </td>
                        </tr>
                    </table>

                </div>
                    """.formatted(nombreTecnico, idIncidencia, descripcion, nombreTecnico, comentario);

    enviar(destinatario, "Incidencia #" + idIncidencia + " — tarea finalizada por técnico", html);
    }


    public void enviarRecuperacion(String destinatario, String nombre, String token) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <!-- Cuerpo -->
                    <div style="padding: 32px 32px 16px 32px;">
                        <p style="font-size: 15px; line-height: 1.6;">
                            Hola <strong>%s</strong>, has solicitado un restablecimiento de contraseña.
                            Utiliza el siguiente código para restablecer tu contraseña:
                        </p>
                        <p style="font-size: 15px; line-height: 1.6;">
                            Si tienes cualquier duda, puedes responder a este correo.
                        </p>
                    </div>

                    <!-- Tarjeta código -->
                    <div style="margin: 0 32px 32px 32px; padding: 20px 24px;
                                border-left: 4px solid #1e3a8a; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 12px 0; font-size: 12px;
                                   font-weight: bold; color: #555; letter-spacing: 0.5px;">
                            CÓDIGO DE RECUPERACIÓN:
                        </p>

                        <!-- Código grande seleccionable -->
                        <div style="text-align: center; margin: 0 0 12px 0;">
                            <span style="font-family: 'Courier New', monospace; font-size: 34px;
                                         font-weight: bold; color: #1e3a8a; letter-spacing: 8px;
                                         background-color: #e8eef7; padding: 14px 28px;
                                         border-radius: 6px; display: inline-block;
                                         user-select: all; cursor: text;">
                                %s
                            </span>
                        </div>
                        <p style="margin: 0 0 14px 0; font-size: 12px; color: #9ca3af; text-align: center;">
                            Haz clic sobre el código para seleccionarlo
                        </p>

                        <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                            Este código expirará en <strong>15 minutos</strong>.
                        </p>
                    </div>

                    <!-- Footer -->
                    <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                            </td>
                            <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                                <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0;">
                                    <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                                </p>
                                <p style="margin: 4px 0 0 0;">Madrid, España</p>
                            </td>
                        </tr>
                    </table>

                </div>
                """.formatted(nombre, token);

        enviar(destinatario, "Recuperación de cuenta", html);
    }

    public void enviarValidacion(String destinatario, String nombre, String token) {
        String urlDestino = "http://localhost:5173/incidencias-urbanas/login?token=" + token;
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <!-- Cuerpo -->
                    <div style="padding: 32px 32px 8px 32px;">
                        <p style="font-size: 15px; line-height: 1.6;">
                            Hola <strong>%s</strong>, tu cuenta en UrbanDesk está casi lista.
                            Solo necesitas confirmar tu dirección de correo haciendo clic en el botón de abajo.
                        </p>
                        <p style="font-size: 15px; line-height: 1.6;">
                            Este paso es necesario para activar tu cuenta y poder acceder a la plataforma.
                        </p>
                    </div>

                    <!-- CTA principal -->
                    <div style="padding: 24px 32px 32px 32px; text-align: center;">
                        <a href="%s"
                           style="display: inline-block; background-color: #1e3a8a; color: #ffffff;
                                  font-size: 15px; font-weight: bold; text-decoration: none;
                                  padding: 14px 36px; border-radius: 6px; letter-spacing: 0.3px;">
                            Activar mi cuenta
                        </a>
                        <p style="margin: 16px 0 0 0; font-size: 13px; color: #6b7280;">
                            Este enlace expirará en <strong>30 minutos</strong>.
                        </p>
                    </div>

                    <!-- Enlace alternativo -->
                    <div style="margin: 0 32px 32px 32px; padding: 14px 18px;
                                border-left: 4px solid #e5e7eb; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 6px 0; font-size: 11px;
                                   font-weight: bold; color: #9ca3af; letter-spacing: 0.5px;">
                            ¿EL BOTÓN NO FUNCIONA?
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280; word-break: break-all;">
                            Copia y pega este enlace en tu navegador:<br>
                            <a href="%s" style="color: #1e3a8a;">%s</a>
                        </p>
                    </div>

                    <!-- Footer -->
                    <table width="100%%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; padding: 24px 32px;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e3a8a;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; letter-spacing: 1px;">GESTIÓN DE INCIDENCIAS URBANAS</p>
                            </td>
                            <td style="text-align: right; font-size: 13px; color: #4b5563; vertical-align: middle;">
                                <p style="margin: 0; font-weight: bold;">UrbanDesk</p>
                                <p style="margin: 4px 0 0 0;">
                                    <a href="mailto:urbandesk@javimoralesg.com" style="color: #1e3a8a; text-decoration: none;">urbandesk@javimoralesg.com</a>
                                </p>
                                <p style="margin: 4px 0 0 0;">Madrid, España</p>
                            </td>
                        </tr>
                    </table>

                </div>
                """.formatted(nombre, urlDestino, urlDestino, urlDestino);

        enviar(destinatario, "Activa tu cuenta en UrbanDesk", html);
    }

}