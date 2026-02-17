// Manejo del formulario de encuesta y contacto de audífonos
(function() {
    'use strict';

    // Configuración
    const CONFIG = {
        emailDestino: 'contacto@otorrinoenpilar.com',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        formatosPermitidos: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    };

    // Variables globales
    let audiometriaArchivo = null;
    let preferenciasUsuario = {};

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initFormularioEncuesta();
        initFormularioContacto();
        initAudiometriaUpload();
        setupToggleButtons();
    });

    // Inicializar formulario de encuesta
    function initFormularioEncuesta() {
        const formulario = document.getElementById('ha_formulario_encuesta');
        if (!formulario) return;

        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarEncuesta();
        });
    }

    // Procesar encuesta
    function procesarEncuesta() {
        const formulario = document.getElementById('ha_formulario_encuesta');
        if (!formulario) return;

        const formData = new FormData(formulario);
        preferenciasUsuario = {};

        // Mapeo de etiquetas amigables
        const etiquetas = {
            ha_cantidad_audifonos: 'Cantidad de audífonos',
            ha_estetica: 'Importancia estética',
            ha_adaptacion: 'Tipo de adaptación',
            ha_comodidad: 'Importancia comodidad',
            ha_alimentacion: 'Tipo de alimentación',
            ha_bluetooth: 'Conectividad Bluetooth',
            ha_control: 'Control de volumen/programas',
            ha_ruido: 'Ambientes ruidosos',
            ha_microfono: 'Micrófono direccional',
            ha_telebobina: 'Sistema bucle inductivo',
            ha_presupuesto: 'Presupuesto',
            ha_otras_consideraciones: 'Otras consideraciones'
        };

        // Respuestas amigables
        const respuestasAmigables = {
            // Cantidad
            uno: 'Un audífono',
            dos: 'Dos audífonos',
            indiferente: 'Indiferente / Según recomendación',
            
            // Estética
            muy_importante: 'Muy importante',
            importante: 'Importante',
            poco_importante: 'Poco importante',
            
            // Adaptación
            dentro_oido: 'Dentro del oído (ITE, ITC, CIC)',
            retroauricular: 'Detrás de la oreja (BTE)',
            no_seguro: 'No estoy seguro/a',
            
            // Alimentación
            recargables: 'Recargables',
            pilas: 'A pila',
            
            // Bluetooth
            si: 'Sí, definitivamente',
            tal_vez: 'Tal vez',
            no: 'No, no lo necesito',
            
            // Ruido
            frecuente: 'Sí, con frecuencia',
            a_veces: 'A veces',
            rara_vez: 'Rara vez',
            nunca: 'No, nunca o casi nunca',
            
            // Utilidad
            muy_util: 'Sí, me sería muy útil',
            no_necesito: 'No creo que lo necesite',
            
            // Presupuesto
            menos_450: 'Menos de ARS 450.000',
            '450_800': 'Entre ARS 450.000 y ARS 800.000',
            '800_1200': 'Entre ARS 800.000 y ARS 1.200.000',
            mas_1200: 'Más de ARS 1.200.000',
            discutir: 'Prefiero discutir las opciones primero'
        };

        // Extraer respuestas
        for (let [key, value] of formData.entries()) {
            const etiqueta = etiquetas[key] || key;
            const valorAmigable = respuestasAmigables[value] || value;
            preferenciasUsuario[etiqueta] = valorAmigable;
        }

        mostrarResultados();
        mostrarFormularioContacto();
    }

    // Mostrar resultados de la encuesta
    function mostrarResultados() {
        const divResultados = document.getElementById('ha_resultados');
        const listaPreferencias = document.getElementById('ha_lista_preferencias');
        
        if (!divResultados || !listaPreferencias) return;

        listaPreferencias.innerHTML = '';
        
        for (let [key, value] of Object.entries(preferenciasUsuario)) {
            const item = document.createElement('div');
            item.className = 'mb-2 p-2 border-bottom';
            item.innerHTML = `<strong>${key}:</strong> ${value}`;
            listaPreferencias.appendChild(item);
        }

        divResultados.style.display = 'block';
        divResultados.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Mostrar formulario de contacto
    function mostrarFormularioContacto() {
        const formularioContacto = document.getElementById('ha_formulario_contacto');
        if (formularioContacto) {
            formularioContacto.style.display = 'block';
            formularioContacto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Inicializar formulario de contacto
    function initFormularioContacto() {
        const formulario = document.getElementById('ha_formulario_contacto_form');
        if (!formulario) return;

        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar formulario Bootstrap
            if (!formulario.checkValidity()) {
                e.stopPropagation();
                formulario.classList.add('was-validated');
                return;
            }
            
            enviarConsulta();
        });
    }

    // Inicializar upload de audiometría
    function initAudiometriaUpload() {
        const inputFile = document.getElementById('ha_audiometria_file');
        if (!inputFile) return;

        inputFile.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (!archivo) return;

            // Validar tamaño
            if (archivo.size > CONFIG.maxFileSize) {
                alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
                inputFile.value = '';
                return;
            }

            // Validar formato
            if (!CONFIG.formatosPermitidos.includes(archivo.type)) {
                alert('Formato de archivo no permitido. Use JPG, PNG o PDF.');
                inputFile.value = '';
                return;
            }

            audiometriaArchivo = archivo;
            actualizarInfoArchivo(archivo);
        });
    }

    // Actualizar información del archivo
    function actualizarInfoArchivo(archivo) {
        const infoArchivo = document.getElementById('ha_info_archivo');
        if (!infoArchivo) return;

        const tamanoMB = (archivo.size / (1024 * 1024)).toFixed(2);
        infoArchivo.innerHTML = `
            <div class="alert alert-success mt-2">
                <i class="fas fa-check-circle"></i> 
                Archivo seleccionado: <strong>${archivo.name}</strong> (${tamanoMB} MB)
            </div>
        `;
    }

    // Enviar consulta
    function enviarConsulta() {
        const botonEnviar = document.querySelector('#ha_formulario_contacto_form button[type="submit"]');
        if (!botonEnviar) return;

        // Deshabilitar botón mientras se envía
        botonEnviar.disabled = true;
        botonEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

        // Recopilar datos
        const nombre = document.getElementById('ha_nombre')?.value || '';
        const email = document.getElementById('ha_email')?.value || '';
        const telefono = document.getElementById('ha_telefono')?.value || '';
        const edad = document.getElementById('ha_edad')?.value || 'No especificada';
        const tieneAudiometria = document.getElementById('ha_tiene_audiometria')?.value || '';
        const consultas = document.getElementById('ha_consultas')?.value || '';
        const contactoPreferido = document.getElementById('ha_contacto_preferido')?.value || '';
        const horarioPreferido = document.getElementById('ha_horario_preferido')?.value || '';

        // Preparar contenido del email
        const contenidoEmail = generarContenidoEmail(
            nombre, email, telefono, edad, tieneAudiometria, 
            consultas, contactoPreferido, horarioPreferido
        );

        // En un entorno real, aquí se enviaría el email usando un backend
        // Por ahora, mostramos la información y abrimos el cliente de email del usuario
        abrirClienteEmail(contenidoEmail);

        // Mostrar confirmación
        setTimeout(() => {
            mostrarConfirmacion();
            resetearFormularios();
            botonEnviar.disabled = false;
            botonEnviar.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Consulta';
        }, 1000);
    }

    // Generar contenido del email
    function generarContenidoEmail(nombre, email, telefono, edad, tieneAudiometria, consultas, contactoPreferido, horarioPreferido) {
        let contenido = `CONSULTA SOBRE AUDÍFONOS\n\n`;
        contenido += `=================================\n`;
        contenido += `DATOS DE CONTACTO\n`;
        contenido += `=================================\n`;
        contenido += `Nombre: ${nombre}\n`;
        contenido += `Email: ${email}\n`;
        contenido += `Teléfono: ${telefono}\n`;
        contenido += `Edad: ${edad}\n`;
        contenido += `Contacto preferido: ${contactoPreferido}\n`;
        contenido += `Horario preferido: ${horarioPreferido}\n\n`;
        
        contenido += `=================================\n`;
        contenido += `AUDIOMETRÍA\n`;
        contenido += `=================================\n`;
        const audiometriaTexto = {
            'si': 'Tiene una audiometría (adjuntará al email)',
            'realizare': 'Realizará la audiometría online',
            'no': 'No tiene audiometría - solicita que se la realicen'
        };
        contenido += `Estado: ${audiometriaTexto[tieneAudiometria] || tieneAudiometria}\n\n`;
        
        contenido += `=================================\n`;
        contenido += `PREFERENCIAS DE AUDÍFONOS\n`;
        contenido += `=================================\n`;
        
        for (let [key, value] of Object.entries(preferenciasUsuario)) {
            contenido += `${key}: ${value}\n`;
        }
        
        contenido += `\n=================================\n`;
        contenido += `CONSULTAS ADICIONALES\n`;
        contenido += `=================================\n`;
        contenido += consultas || 'Sin consultas adicionales';
        
        if (audiometriaArchivo) {
            contenido += `\n\n=================================\n`;
            contenido += `NOTA: El paciente adjuntará audiometría (${audiometriaArchivo.name})\n`;
        }
        
        return contenido;
    }

    // Abrir cliente de email
    function abrirClienteEmail(contenido) {
        const asunto = 'Consulta sobre Audífonos - Sitio Web';
        const cuerpo = encodeURIComponent(contenido);
        const mailto = `mailto:${CONFIG.emailDestino}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
        
        // Nota para el usuario
        const mensajeAdjunto = audiometriaArchivo 
            ? '\n\nNOTA IMPORTANTE: No olvide adjuntar su audiometría al email que se abrirá.'
            : '';
        
        if (confirm(`Se abrirá su cliente de email para enviar la consulta.${mensajeAdjunto}\n\n¿Desea continuar?`)) {
            window.location.href = mailto;
        }
    }

    // Mostrar confirmación
    function mostrarConfirmacion() {
        const divConfirmacion = document.getElementById('ha_confirmacion');
        if (!divConfirmacion) return;

        divConfirmacion.style.display = 'block';
        divConfirmacion.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <h5 class="alert-heading"><i class="fas fa-check-circle me-2"></i>¡Gracias por su consulta!</h5>
                <p>Hemos preparado su consulta. ${audiometriaArchivo ? 'No olvide adjuntar su audiometría al email.' : ''}</p>
                <p class="mb-0"><small>Nos pondremos en contacto con usted a la brevedad.</small></p>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        divConfirmacion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Resetear formularios
    function resetearFormularios() {
        const formEncuesta = document.getElementById('ha_formulario_encuesta');
        const formContacto = document.getElementById('ha_formulario_contacto_form');
        
        if (formEncuesta) formEncuesta.reset();
        if (formContacto) {
            formContacto.reset();
            formContacto.classList.remove('was-validated');
        }
        
        audiometriaArchivo = null;
        preferenciasUsuario = {};
        
        const infoArchivo = document.getElementById('ha_info_archivo');
        if (infoArchivo) infoArchivo.innerHTML = '';
        
        const formularioContacto = document.getElementById('ha_formulario_contacto');
        if (formularioContacto) formularioContacto.style.display = 'none';
        
        const resultados = document.getElementById('ha_resultados');
        if (resultados) resultados.style.display = 'none';
    }

    // Configurar botones de toggle (Ver más/Ver menos)
    function setupToggleButtons() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.textContent = isExpanded ? 'Ver menos' : 'Ver más';
            });
        });
    }

})();
