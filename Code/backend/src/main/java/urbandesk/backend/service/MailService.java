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
                        <strong style="color: #1e3a8a;">CREADA</strong>
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
                            border-left: 4px solid #26f50b; background-color: #f8f9fa;
                            border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px;
                            font-weight: bold; color: #555; letter-spacing: 0.5px;">
                        DATOS DE TU INCIDENCIA:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Nº incidencia: </em>
                        <strong style="color: #26f50b;">#%d</strong>
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;">
                        <em>Descripción: </em>
                        <span>%s</span>
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                        <em>Estado: </em>
                        <strong style="color: #26f50b;">RESUELTA</strong>
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
                """.formatted(idIncidencia, titulo);

        enviar(destinatario, "Incidencia #" + idIncidencia + " resuelta", html);
    }

    public void enviarIncidenciaAsignadaOperador(String destinatario, Long idIncidencia,
        String descripcion, Ubicacion ubicacion) {
    String html = """
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0;">UrbanDesk</h1>
                </div>
                <div style="padding: 32px; background-color: #f9fafb;">
                    <h2 style="color: #1f2937;">Nueva incidencia asignada</h2>
                    <p style="color: #4b5563;">Se te ha asignado una nueva incidencia para su gestión.</p>
                    <div style="background-color: white; border-left: 4px solid #f59e0b;
                                padding: 16px; margin: 16px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #6b7280;">Nº incidencia: <strong>#%d</strong></p>
                        <p style="margin: 8px 0 0; color: #6b7280;">Descripción: <strong>%s</strong></p>
                        <p style="margin: 8px 0 0; color: #6b7280;">Ubicación: <strong>%s</strong></p>
                    </div>
                    <p style="color: #4b5563;">Accede a la plataforma para validar y gestionar la incidencia.</p>
                </div>
                <div style="padding: 16px; background-color: #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px;">© 2026 UrbanDesk. Todos los derechos reservados.</p>
                </div>
            </div>
            """.formatted(idIncidencia, descripcion, ubicacion.toString());

    enviar(destinatario, "Nueva incidencia asignada #" + idIncidencia, html);
    } 

    public void enviarIncidenciaAsignadaTecnico(String destinatario, Long idIncidencia,
        String descripcion, Ubicacion ubicacion) {
    String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0;">UrbanDesk</h1>
                </div>
                <div style="padding: 32px; background-color: #f9fafb;">
                    <h2 style="color: #1f2937;">Nueva incidencia asignada</h2>
                    <p style="color: #4b5563;">Se te ha asignado una nueva incidencia para su gestión.</p>
                    <div style="background-color: white; border-left: 4px solid #f59e0b;
                                padding: 16px; margin: 16px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #6b7280;">Nº incidencia: <strong>#%d</strong></p>
                        <p style="margin: 8px 0 0; color: #6b7280;">Descripción: <strong>%s</strong></p>
                        <p style="margin: 8px 0 0; color: #6b7280;">Ubicación: <strong>%s</strong></p>
                    </div>
                    <p style="color: #4b5563;">Accede a la plataforma para validar y gestionar la incidencia.</p>
                </div>
                <div style="padding: 16px; background-color: #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px;">© 2026 UrbanDesk. Todos los derechos reservados.</p>
                </div>
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
                                border-left: 4px solid #26f50b; background-color: #f8f9fa;
                                border-radius: 0 4px 4px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 12px;
                                font-weight: bold; color: #555; letter-spacing: 0.5px;">
                            DATOS DE LA INCIDENCIA:
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Nº incidencia: </em>
                            <strong style="color: #26f50b;">#%d</strong>
                        </p>
                        <p style="margin: 0 0 6px 0; font-size: 14px;">
                            <em>Descripción: </em>
                            <span>%s</span>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Técnico: </em>
                            <strong style="color: #26f50b;">%s</strong>
                        </p>
                        <p style="margin: 0; font-size: 14px;">
                            <em>Comentario: </em>
                            <strong style="color: #26f50b;">%s</strong>
                        </p>
                    </div>

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
                    """.formatted(nombreTecnico, idIncidencia, descripcion, nombreTecnico, comentario);

    enviar(destinatario, "Incidencia #" + idIncidencia + " — tarea finalizada por técnico", html);
    }

}