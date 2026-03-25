package urbandesk.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 255)
    private String email;

    @Size(min = 8, max = 255, message = "Mínimo 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9]).+$",
        message = "Debe tener al menos una mayúscula y un número"
    )
    private String password;
}
