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
            // Validar formulario Bootstrap
            if (!formulario.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                formulario.classList.add('was-validated');
                return;
            }

            // Integrar preferencias de encuesta al formulario de contacto
            // Elimina campos previos para evitar duplicados
            Array.from(formulario.querySelectorAll('.ha-preferencia-hidden')).forEach(el => el.remove());
            for (let [key, value] of Object.entries(preferenciasUsuario)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'Preferencia: ' + key;
                input.value = value;
                input.className = 'ha-preferencia-hidden';
                formulario.appendChild(input);
            }
            // El submit continúa y Formsubmit enviará los datos
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
