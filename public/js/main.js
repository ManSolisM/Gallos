let filaCounter = 0;
    let columnaCounter = 3;
    let columnasData = [
      { numeroTalon: 'Talón', idTalon: '1', nombreUsuario: 'corredor1' },
      { numeroTalon: 'Talón', idTalon: '2', nombreUsuario: 'corredor2' },
      { numeroTalon: 'Talón', idTalon: '3', nombreUsuario: 'corredor3' }
    ];
    let historialesPrestamos = [[], [], []];
    let historialesGanancias = [[], [], []];
    let historialGananciasEmpresa = [];

    function inicializarTabla() {
      const body = document.getElementById("tabla-body");
      body.innerHTML = '';
      
      for (let i = 1; i <= 20; i++) {
        agregarFilaHtml(i);
      }
      filaCounter = 20;
      
      agregarEventListeners();
      recalcular();
      recalcularConPrestamos();
      recalcularConGanancias();
    }

    function agregarFilaHtml(numero) {
      const body = document.getElementById("tabla-body");
      let fila = `<tr id="fila-${numero}">
                    <td>
                      <select class="form-control ganador-select" data-fila="${numero}">
                        <option value="">marca color</option>
                        <option value="verde" style="color: #28a745;">🟢 VERDE</option>
                        <option value="rojo" style="color: #dc3545;">🔴 ROJO</option>
                        <option value="tablas" style="color: #6c757d;">⚪ TABLAS</option>
                      </select>
                    </td>
                    <td><strong>${numero}</strong></td>`;
      
      for (let j = 1; j <= columnaCounter; j++) {
        fila += `<td><input type="number" value="00" class="form-control input-cell valor" data-col="${j}" data-fila="${numero}"></td>`;
      }
      
      fila += `<td><button class="delete-btn" onclick="eliminarFila(${numero})" title="Eliminar fila">🗑️</button></td></tr>`;
      body.innerHTML += fila;
    }

    function agregarFila() {
      filaCounter++;
      agregarFilaHtml(filaCounter);
      agregarEventListeners();
      recalcular();
      recalcularConPrestamos();
      recalcularConGanancias();
    }

    function eliminarFila(numero) {
      if (confirm('¿Estás seguro de eliminar esta fila?')) {
        const fila = document.getElementById(`fila-${numero}`);
        if (fila) {
          fila.remove();
          recalcular();
          recalcularConPrestamos();
          recalcularConGanancias();
        }
      }
    }

    function agregarColumna() {
      columnaCounter++;
      
      columnasData.push({
        numeroTalon: 'Talón',
        idTalon: String(columnaCounter),
        nombreUsuario: 'corredor' + columnaCounter
      });
      historialesPrestamos.push([]);
      historialesGanancias.push([]);
      
      const thead = document.getElementById("tabla-head").querySelector("tr");
      const thAcciones = thead.lastElementChild;
      const newTh = document.createElement("th");
      newTh.id = `col-${columnaCounter}`;
      newTh.innerHTML = `
        <div class="header-content">
          <input type="text" value="Talón" class="numero-talon" onchange="actualizarNumeroTalon(${columnaCounter}, this.value)" placeholder="Nombre Talón">
          <input type="text" value="${columnaCounter}" class="numero-talon" onchange="actualizarIdTalon(${columnaCounter}, this.value)" placeholder="ID">
          <input type="text" value="corredor${columnaCounter}" class="nombre-usuario" onchange="actualizarNombreUsuario(${columnaCounter}, this.value)" placeholder="Corredor">
          <button class="delete-col-btn" onclick="eliminarColumna(${columnaCounter})" title="Eliminar columna">🗑️</button>
        </div>
      `;
      thead.insertBefore(newTh, thAcciones);
      
      const rows = document.querySelectorAll("#tabla-body tr");
      rows.forEach(row => {
        const tdAcciones = row.lastElementChild;
        const newTd = document.createElement("td");
        const numeroFila = row.id.split('-')[1];
        newTd.innerHTML = `<input type="number" value="00" class="form-control input-cell valor" data-col="${columnaCounter}" data-fila="${numeroFila}">`;
        row.insertBefore(newTd, tdAcciones);
      });
      
      const tfoot = document.getElementById("tabla-foot");
      const rows2 = tfoot.querySelectorAll("tr");
      
      rows2[0].insertBefore(crearCelda(`menos${columnaCounter}`, "0"), rows2[0].lastElementChild);
      rows2[1].insertBefore(crearCelda(`resultado-usuario${columnaCounter}`, "0"), rows2[1].lastElementChild);
      rows2[2].insertBefore(crearCelda(`resultado-casa${columnaCounter}`, "0"), rows2[2].lastElementChild);
      
      const prestamoCelda = document.createElement("td");
      prestamoCelda.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
          <input type="number" id="prestamo-usuario${columnaCounter}" value="0" class="form-control prestamo-input" onchange="recalcularConPrestamos()" placeholder="0">
          <button class="btn btn-sm btn-outline-primary prestamo-btn" onclick="agregarPrestamo(${columnaCounter})">+ Préstamo o Descuento</button>
        </div>
      `;
      rows2[3].insertBefore(prestamoCelda, rows2[3].lastElementChild);
      
      const totalEmpresaCelda = document.createElement("td");
      totalEmpresaCelda.id = `total-empresa-individual${columnaCounter}`;
      totalEmpresaCelda.style.fontSize = "14px";
      totalEmpresaCelda.style.color = "#0066cc";
      totalEmpresaCelda.innerHTML = "<strong>0</strong>";
      rows2[5].insertBefore(totalEmpresaCelda, rows2[5].lastElementChild);
      
      const totalFinalCelda = document.createElement("td");
      totalFinalCelda.id = `total-final-usuario${columnaCounter}`;
      totalFinalCelda.style.fontSize = "16px";
      totalFinalCelda.style.color = "#28a745";
      totalFinalCelda.innerHTML = "<strong>0</strong>";
      rows2[6].insertBefore(totalFinalCelda, rows2[6].lastElementChild);
      
      const historialContainer = document.getElementById("contenedor-historiales");
      const nuevoHistorial = document.createElement("div");
      nuevoHistorial.innerHTML = `
        <span class="label-usuario" id="label-usuario${columnaCounter}">corredor${columnaCounter}:</span>
        <div id="historial-prestamos${columnaCounter}" class="historial-container">
          <em>No hay préstamos registrados</em>
        </div>
      `;
      historialContainer.appendChild(nuevoHistorial);
      
      agregarEventListeners();
      recalcular();
      recalcularConPrestamos();
      recalcularConGanancias();
    }

    function crearCelda(id, texto) {
      const td = document.createElement("td");
      td.id = id;
      td.innerHTML = `<strong>${texto}</strong>`;
      return td;
    }

    function eliminarColumna(colNum) {
      if (columnaCounter <= 1) {
        alert('Debes mantener al menos una columna.');
        return;
      }
      
      if (confirm('¿Estás seguro de eliminar esta columna?')) {
        const th = document.getElementById(`col-${colNum}`);
        if (th) th.remove();
        
        document.querySelectorAll(`input[data-col="${colNum}"]`).forEach(input => {
          input.closest('td').remove();
        });
        
        const elementos = [
          `menos${colNum}`,
          `resultado-usuario${colNum}`,
          `resultado-casa${colNum}`,
          `total-final-usuario${colNum}`,
          `total-empresa-individual${colNum}`
        ];
        
        elementos.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
        
        const prestamoInput = document.getElementById(`prestamo-usuario${colNum}`);
        if (prestamoInput) prestamoInput.closest('td').remove();

        const historialDiv = document.getElementById(`historial-prestamos${colNum}`);
        if (historialDiv) historialDiv.closest('div').remove();
        
        const index = columnasData.findIndex((col, idx) => idx + 1 === colNum);
        if (index !== -1) {
          columnasData.splice(index, 1);
          historialesPrestamos.splice(index, 1);
        }
        
        recalcular();
        recalcularConPrestamos();
        recalcularConGanancias();
      }
    }

    function agregarEventListeners() {
  document.querySelectorAll(".valor").forEach(input => {
    input.removeEventListener("input", recalcular);
    input.addEventListener("input", recalcular);
  });
  agregarEventListenersPosicion(); // Agregar esta línea
}

    function recalcular() {
      const porcentajeDescuento = Number(document.getElementById("porcentaje-descuento").value) || 0;
      const porcentajeUsuario = Number(document.getElementById("porcentaje-usuario").value) || 70;
      const porcentajeCasa = Number(document.getElementById("porcentaje-casa").value) || 30;
      
      document.getElementById("porcentaje-mostrar").innerText = porcentajeDescuento;
      document.getElementById("porcentaje-usuario-mostrar").innerText = porcentajeUsuario;
      document.getElementById("porcentaje-casa-mostrar").innerText = porcentajeCasa;
      
      for (let j = 1; j <= columnaCounter; j++) {
        let suma = 0;
        document.querySelectorAll(`input[data-col="${j}"]`).forEach(input => {
          suma += Number(input.value) || 0;
        });
        
        const descuento = suma * (porcentajeDescuento / 100);
        const paraUsuario = descuento * (porcentajeUsuario / 100);
        const paraCasa = descuento * (porcentajeCasa / 100);
        
        const menosEl = document.getElementById("menos" + j);
        const usuarioEl = document.getElementById("resultado-usuario" + j);
        const casaEl = document.getElementById("resultado-casa" + j);
        
        if (menosEl) menosEl.innerText = descuento.toFixed(0);
        if (usuarioEl) usuarioEl.innerText = paraUsuario.toFixed(0);
        if (casaEl) casaEl.innerText = paraCasa.toFixed(0);
      }
      
      recalcularConPrestamos();
      recalcularConGanancias();
    }

    function agregarGananciaEmpresa() {
      const gananciaInput = document.getElementById(`ganancia-empresa-total`);
      const cantidadGanancia = Number(gananciaInput.value);
      
      if (cantidadGanancia > 0) {
        const descripcion = prompt(`Describe la ganancia adicional de ${cantidadGanancia} para la Empresa:`, 'Ganancia adicional');
        
        if (descripcion !== null) {
          const fecha = new Date().toLocaleDateString();
          const ganancia = {
            cantidad: cantidadGanancia,
            descripcion: descripcion || 'Sin descripción',
            fecha: fecha
          };
          
          historialGananciasEmpresa.push(ganancia);
          gananciaInput.value = 0;
          actualizarHistorialGananciasEmpresa();
          recalcularConGanancias();
        }
      } else {
        alert('Por favor, ingresa una cantidad mayor a 0 para la ganancia.');
      }
    }

    function actualizarHistorialGananciasEmpresa() {
      const historialDiv = document.getElementById(`historial-ganancias-empresa`);
      
      if (historialGananciasEmpresa.length === 0) {
        historialDiv.innerHTML = '<em>No hay ganancias registradas</em>';
      } else {
        let html = '';
        historialGananciasEmpresa.forEach((ganancia, index) => {
          html += `
            <div style="border-bottom: 1px solid #eee; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${ganancia.cantidad}</strong><br>
                <small>${ganancia.descripcion}</small><br>
                <tiny style="color: #666;">${ganancia.fecha}</tiny>
              </div>
              <button onclick="eliminarGananciaEmpresa(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 1px 4px; font-size: 9px; cursor: pointer;" title="Eliminar ganancia">✕</button>
            </div>
          `;
        });
        historialDiv.innerHTML = html;
      }
    }

    function eliminarGananciaEmpresa(index) {
      if (confirm('¿Estás seguro de eliminar esta ganancia?')) {
        historialGananciasEmpresa.splice(index, 1);
        actualizarHistorialGananciasEmpresa();
        recalcularConGanancias();
      }
    }

    function recalcularConGanancias() {
      let totalEmpresaConsolidado = 0;
      
      const gananciasTotales = historialGananciasEmpresa.reduce((sum, ganancia) => sum + ganancia.cantidad, 0);
      
      for (let j = 1; j <= columnaCounter; j++) {
        const resultadoCasaEl = document.getElementById("resultado-casa" + j);
        const totalEmpresaIndividualEl = document.getElementById("total-empresa-individual" + j);
        
        if (resultadoCasaEl && totalEmpresaIndividualEl) {
          const resultadoCasa = Number(resultadoCasaEl.innerText) || 0;
          totalEmpresaConsolidado += resultadoCasa;
          totalEmpresaIndividualEl.innerText = resultadoCasa.toFixed(0);
        }
      }
      
      const totalFinal = totalEmpresaConsolidado + gananciasTotales;
      
      const totalConsolidadoEl = document.getElementById("total-empresa-consolidado");
      if (totalConsolidadoEl) {
        totalConsolidadoEl.innerHTML = `<strong>TOTAL: ${totalFinal.toFixed(0)}</strong>`;
      }
    }

    function agregarPrestamo(usuario) {
      const prestamoInput = document.getElementById(`prestamo-usuario${usuario}`);
      const cantidadPrestamo = Number(prestamoInput.value);
      
      if (cantidadPrestamo > 0) {
        const descripcion = prompt(`Describe el descuento o prestamo de ${cantidadPrestamo} para ${columnasData[usuario-1]?.nombreUsuario || 'usuario' + usuario}:`, 'Préstamo general');
        
        if (descripcion !== null) {
          const fecha = new Date().toLocaleDateString();
          const prestamo = {
            cantidad: cantidadPrestamo,
            descripcion: descripcion || 'Sin descripción',
            fecha: fecha
          };
          
          historialesPrestamos[usuario - 1].push(prestamo);
          prestamoInput.value = 0;
          actualizarHistorialPrestamos(usuario);
          recalcularConPrestamos();
        }
      } else {
        alert('Por favor, ingresa una cantidad mayor a 0 para el préstamo.');
      }
    }

    function actualizarHistorialPrestamos(usuario) {
      const historialDiv = document.getElementById(`historial-prestamos${usuario}`);
      const prestamos = historialesPrestamos[usuario - 1];
      
      if (prestamos.length === 0) {
        historialDiv.innerHTML = '<em>No hay préstamos registrados</em>';
      } else {
        let html = '';
        prestamos.forEach((prestamo, index) => {
          html += `
            <div style="border-bottom: 1px solid #eee; padding: 2px 0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${prestamo.cantidad}</strong><br>
                <small>${prestamo.descripcion}</small><br>
                <tiny style="color: #666;">${prestamo.fecha}</tiny>
              </div>
              <button onclick="eliminarPrestamo(${usuario}, ${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 1px 4px; font-size: 9px; cursor: pointer;" title="Eliminar préstamo">✕</button>
            </div>
          `;
        });
        historialDiv.innerHTML = html;
      }
    }

    function eliminarPrestamo(usuario, index) {
      if (confirm('¿Estás seguro de eliminar este préstamo?')) {
        historialesPrestamos[usuario - 1].splice(index, 1);
        actualizarHistorialPrestamos(usuario);
        recalcularConPrestamos();
      }
    }

    function recalcularConPrestamos() {
      for (let j = 1; j <= columnaCounter; j++) {
        const resultadoUsuarioEl = document.getElementById("resultado-usuario" + j);
        const totalFinalEl = document.getElementById("total-final-usuario" + j);
        
        if (resultadoUsuarioEl && totalFinalEl) {
          const resultadoUsuario = Number(resultadoUsuarioEl.innerText) || 0;
          
          let totalPrestamos = 0;
          if (historialesPrestamos[j - 1]) {
            totalPrestamos = historialesPrestamos[j - 1].reduce((sum, prestamo) => sum + prestamo.cantidad, 0);
          }
          
          const totalFinal = resultadoUsuario - totalPrestamos;
          totalFinalEl.innerText = totalFinal.toFixed(0);
          
          if (totalFinal < 0) {
            totalFinalEl.style.color = '#dc3545';
          } else {
            totalFinalEl.style.color = '#28a745';
          }
        }
      }
    }

    function aplicarDistribucion(usuario, casa) {
      document.getElementById("porcentaje-usuario").value = usuario;
      document.getElementById("porcentaje-casa").value = casa;
      recalcular();
    }

    function actualizarDistribucion() {
      const usuario = Number(document.getElementById("porcentaje-usuario").value);
      const casa = 100 - usuario;
      document.getElementById("porcentaje-casa").value = casa;
    }

    function aplicarDistribucionPersonalizada() {
      recalcular();
    }

    function resetearTabla() {
      if (confirm('¿Estás seguro de resetear toda la tabla? Esto borrará todos los datos.')) {
        location.reload();
      }
    }

    function buscarPelea() {
      const numeroBuscar = document.getElementById("buscador-pelea").value;
      const resultadoBusqueda = document.getElementById("resultado-busqueda");
      const mensajeBusqueda = document.getElementById("mensaje-busqueda");
      const todasLasFilas = document.querySelectorAll("#tabla-body tr");
      
      todasLasFilas.forEach(fila => {
        fila.classList.remove("fila-encontrada", "fila-oculta");
      });
      
      if (!numeroBuscar) {
        resultadoBusqueda.style.display = "none";
        return;
      }
      
      let filaEncontrada = false;
      
      todasLasFilas.forEach(fila => {
        const numeroFila = fila.querySelector("td:nth-child(2)").textContent.trim();
        
        if (numeroFila === numeroBuscar) {
          fila.classList.add("fila-encontrada");
          filaEncontrada = true;
          
          setTimeout(() => {
            fila.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }, 100);
          
          resultadoBusqueda.className = "alert alert-success";
          mensajeBusqueda.innerHTML = `✅ Pelea #${numeroBuscar} encontrada`;
        } else {
          fila.classList.add("fila-oculta");
        }
      });
      
      if (!filaEncontrada) {
        resultadoBusqueda.className = "alert alert-warning";
        mensajeBusqueda.innerHTML = `⚠️ No se encontró la pelea #${numeroBuscar}`;
        
        todasLasFilas.forEach(fila => {
          fila.classList.remove("fila-oculta");
        });
      }
      
      resultadoBusqueda.style.display = "block";
    }
    
    function limpiarBusqueda() {
      document.getElementById("buscador-pelea").value = "";
      document.getElementById("resultado-busqueda").style.display = "none";
      
      document.querySelectorAll("#tabla-body tr").forEach(fila => {
        fila.classList.remove("fila-encontrada", "fila-oculta");
      });
    }

    function exportarExcel() {
      const datos = [];
      
      // Agregar información del evento al inicio
      const nombreEvento = document.getElementById('nombre-evento').value || 'Evento sin nombre';
      const fechaEvento = document.getElementById('fecha-evento').value;
      
      datos.push(['INFORMACIÓN DEL EVENTO']);
      datos.push(['Nombre del Evento:', nombreEvento]);
      datos.push(['Fecha:', fechaEvento]);
      datos.push([]);
      datos.push([]);
      
      const encabezados = ['Ganador', 'Número de Pelea'];
      for (let i = 0; i < columnaCounter; i++) {
        const col = columnasData[i];
        if (col) {
          encabezados.push(`${col.nombreUsuario} (${col.numeroTalon} ${col.idTalon})`);
        }
      }
      datos.push(encabezados);
      
      const filas = document.querySelectorAll("#tabla-body tr");
      filas.forEach(fila => {
        const filaDatos = [];
        
        const ganadorSelect = fila.querySelector(".ganador-select");
        const ganadorValor = ganadorSelect.value || "Sin resultado";
        filaDatos.push(ganadorValor.toUpperCase());
        
        const numeroPelea = fila.querySelector("td:nth-child(2)").textContent.trim();
        filaDatos.push(numeroPelea);
        
        const inputs = fila.querySelectorAll(".valor");
        inputs.forEach(input => {
          filaDatos.push(Number(input.value) || 0);
        });
        
        datos.push(filaDatos);
      });
      
      datos.push([]);
      
      const filaDescuento = ['Descuento', `(${document.getElementById("porcentaje-descuento").value}%)`];
      for (let j = 1; j <= columnaCounter; j++) {
        const menosEl = document.getElementById("menos" + j);
        filaDescuento.push(menosEl ? Number(menosEl.innerText) : 0);
      }
      datos.push(filaDescuento);
      
      const porcentajeUsuario = document.getElementById("porcentaje-usuario").value;
      const filaUsuario = ['Para Corredor', `(${porcentajeUsuario}%)`];
      for (let j = 1; j <= columnaCounter; j++) {
        const usuarioEl = document.getElementById("resultado-usuario" + j);
        filaUsuario.push(usuarioEl ? Number(usuarioEl.innerText) : 0);
      }
      datos.push(filaUsuario);
      
      const porcentajeCasa = document.getElementById("porcentaje-casa").value;
      const filaCasa = ['Para Empresa', `(${porcentajeCasa}%)`];
      for (let j = 1; j <= columnaCounter; j++) {
        const casaEl = document.getElementById("resultado-casa" + j);
        filaCasa.push(casaEl ? Number(casaEl.innerText) : 0);
      }
      datos.push(filaCasa);
      
      const filaPrestamos = ['Préstamos del corredor', ''];
      for (let j = 1; j <= columnaCounter; j++) {
        let totalPrestamos = 0;
        if (historialesPrestamos[j - 1]) {
          totalPrestamos = historialesPrestamos[j - 1].reduce((sum, p) => sum + p.cantidad, 0);
        }
        filaPrestamos.push(totalPrestamos);
      }
      datos.push(filaPrestamos);
      
      const gananciaEmpresaTotal = historialGananciasEmpresa.reduce((sum, g) => sum + g.cantidad, 0);
      datos.push(['Ganancias Adicionales Empresa', gananciaEmpresaTotal]);
      
      const filaTotalEmpresa = ['TOTAL GANANCIAS EMPRESA', ''];
      for (let j = 1; j <= columnaCounter; j++) {
        const totalEl = document.getElementById("total-empresa-individual" + j);
        filaTotalEmpresa.push(totalEl ? Number(totalEl.innerText) : 0);
      }
      const totalConsolidado = document.getElementById("total-empresa-consolidado").textContent.replace(' TOTAL :', '').trim();
      filaTotalEmpresa.push(totalConsolidado);
      datos.push(filaTotalEmpresa);
      
      const filaTotalFinal = ['TOTAL FINAL PARA CORREDOR', ''];
      for (let j = 1; j <= columnaCounter; j++) {
        const finalEl = document.getElementById("total-final-usuario" + j);
        filaTotalFinal.push(finalEl ? Number(finalEl.innerText) : 0);
      }
      datos.push(filaTotalFinal);
      
      datos.push([]);
      datos.push(['HISTORIAL DE PRÉSTAMOS']);
      for (let j = 0; j < columnaCounter; j++) {
        if (historialesPrestamos[j] && historialesPrestamos[j].length > 0) {
          datos.push([`${columnasData[j]?.nombreUsuario || 'Corredor ' + (j+1)}:`]);
          historialesPrestamos[j].forEach(p => {
            datos.push(['', p.cantidad, p.descripcion, p.fecha]);
          });
        }
      }
      
      if (historialGananciasEmpresa.length > 0) {
        datos.push([]);
        datos.push(['GANANCIAS DE LA EMPRESA']);
        historialGananciasEmpresa.forEach(g => {
          datos.push([g.cantidad, g.descripcion, g.fecha]);
        });
      }
      
      const ws = XLSX.utils.aoa_to_sheet(datos);
      
      const wscols = [
        {wch: 30},
        {wch: 25}
      ];
      for (let i = 0; i < columnaCounter; i++) {
        wscols.push({wch: 20});
      }
      ws['!cols'] = wscols;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Peleas");
      
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivoEvento = nombreEvento.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      XLSX.writeFile(wb, `${nombreArchivoEvento}_${fecha}.xlsx`);
      
      alert('✅ Excel exportado correctamente con todos los datos!');
    }

    function actualizarNumeroTalon(columna, valor) {
      if (columnasData[columna - 1]) {
        columnasData[columna - 1].numeroTalon = valor;
      }
    }

    function actualizarIdTalon(columna, valor) {
      if (columnasData[columna - 1]) {
        columnasData[columna - 1].idTalon = valor;
      }
    }

    function actualizarNombreUsuario(columna, valor) {
      if (columnasData[columna - 1]) {
        columnasData[columna - 1].nombreUsuario = valor;
      }
      
      const labelUsuario = document.getElementById(`label-usuario${columna}`);
      if (labelUsuario) {
        labelUsuario.textContent = valor + ':';
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
  const fechaActual = new Date();
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  document.getElementById('fecha-evento').value = fechaActual.toLocaleDateString('es-MX', opciones);
  
  inicializarTabla();
  agregarEventListenersPosicion(); // Agregar esta línea
  
  document.getElementById('buscador-pelea').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      buscarPelea();
    }
  });
});

    const exprInput = document.getElementById('expr');
    const calcBtn = document.getElementById('calcBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error');
    const validRe = /^[0-9+\-*/().\s]+$/;

    function mostrarError(msg) { errorEl.textContent = msg || ''; }
    function mostrarResultado(val) { resultEl.textContent = 'Resultado es: ' + val; }

    function parentesisBalanceados(s) {
      let depth = 0;
      for (const ch of s) {
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth < 0) return false; }
      }
      return depth === 0;
    }

    function calcularExpresion() {
      mostrarError('');
      const raw = exprInput.value.trim();
      if (!raw) return mostrarError('Escribe una expresión.');
      if (!validRe.test(raw)) return mostrarError('Caracteres no permitidos.');
      if (!parentesisBalanceados(raw)) return mostrarError('Paréntesis incorrectos.');

      try {
        const fn = new Function('return (' + raw + ')');
        let value = fn();
        if (typeof value !== 'number' || !isFinite(value)) return mostrarError('Resultado inválido.');
        mostrarResultado(Number.isInteger(value) ? value : parseFloat(value.toFixed(12)));
      } catch {
        mostrarError('Error al calcular.');
      }
    }

    calcBtn.addEventListener('click', calcularExpresion);
    clearBtn.addEventListener('click', () => { exprInput.value = ''; mostrarError(''); mostrarResultado('—'); });
    exprInput.addEventListener('keydown', e => { if (e.key === 'Enter') calcularExpresion(); });

    // Función para mostrar la posición actual
function mostrarPosicionActual(input) {
  const numPelea = input.getAttribute('data-fila');
  const numColumna = input.getAttribute('data-col');
  
  const indicador = document.getElementById('indicador-posicion');
  const numPeleaEl = document.getElementById('num-pelea-actual');
  const nombreCorredorEl = document.getElementById('nombre-corredor-actual');
  
  if (numPelea && numColumna) {
    numPeleaEl.textContent = numPelea;
    
    const columnaData = columnasData[numColumna - 1];
    if (columnaData) {
      nombreCorredorEl.textContent = columnaData.nombreUsuario;
    }
    
    indicador.style.display = 'block';
  }
}

// Agregar event listeners a todos los inputs
function agregarEventListenersPosicion() {
  document.querySelectorAll('.valor').forEach(input => {
    input.addEventListener('focus', function() {
      mostrarPosicionActual(this);
    });
  });
}