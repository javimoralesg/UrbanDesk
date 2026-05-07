package urbandesk.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import urbandesk.backend.domain.DomainRuleViolation;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ApiError(String message) {
    }

    @ExceptionHandler(DomainRuleViolation.class)
    public ResponseEntity<ApiError> handleDomainRuleViolation(DomainRuleViolation ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiError(ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null && !ex.getReason().isBlank()
                ? ex.getReason()
                : "Error de negocio";
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(new ApiError(message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpectedException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError("Error interno del servidor"));
    }
}
