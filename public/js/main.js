let filaCounter = 0;
let columnaCounter = 3;
let columnasData = [
  { numeroTalon: 'Talon', idTalon: '1', nombreUsuario: 'corredor1' },
  { numeroTalon: 'Talon', idTalon: '2', nombreUsuario: 'corredor2' },
  { numeroTalon: 'Talon', idTalon: '3', nombreUsuario: 'corredor3' }
];
let historialesPrestamos = [[], [], []];
let historialesDescuentosEmpresa = [];
let historialGananciasEmpresa = [];
let descuentoFantasma = 0;

function inicializarTabla() {
  const body = document.getElementById("tabla-body");
  body.innerHTML = '';
  
  for (let i = 1; i <= 20; i++) {
    agregarFilaHtml(i);
  }
  filaCounter = 20;
  
  const hoy = new Date();
  document.getElementById('fecha-evento').value = hoy.toLocaleDateString('es-MX');
  
  agregarEventListeners();
  recalcular();
}

function agregarFilaHtml(numero) {
  const body = document.getElementById("tabla-body");
  let fila = `<tr id="fila-${numero}">
                <td>
                  <select class="form-control ganador-select" data-fila="${numero}">
                    <option value="">Color ganador</option>
                    <option value="verde" style="color: #28a745;">🟢 VERDE</option>
                    <option value="rojo" style="color: #dc3545;">🔴 ROJO</option>
                    <option value="tablas" style="color: #6c757d;">⚪ TABLAS</option>
                  </select>
                </td>
                <td><strong>${numero}</strong></td>`;
  
  for (let j = 1; j <= columnaCounter; j++) {
    fila += `<td><input type="number" value="" class="form-control input-cell valor" data-col="${j}" data-fila="${numero}"></td>`;
  }
  
  body.innerHTML += fila;
}

function agregarFila() {
  filaCounter++;
  agregarFilaHtml(filaCounter);
  agregarEventListeners();
  recalcular();
}

function eliminarFila(numero) {
  if (confirm('¿Estás seguro de eliminar esta fila?')) {
    const fila = document.getElementById(`fila-${numero}`);
    if (fila) {
      fila.remove();
      recalcular();
    }
  }
}

function agregarColumna() {
  columnaCounter++;
  
  columnasData.push({
    numeroTalon: 'Talon',
    idTalon: String(columnaCounter),
    nombreUsuario: 'corredor' + columnaCounter
  });
  historialesPrestamos.push([]);
  
  const thead = document.getElementById("tabla-head").querySelector("tr");
  const thAcciones = thead.lastElementChild;
  const newTh = document.createElement("th");
  newTh.id = `col-${columnaCounter}`;
  newTh.innerHTML = `
    <div class="header-content">
      <input type="text" value="Talon" class="numero-talon" onchange="actualizarNumeroTalon(${columnaCounter}, this.value)" placeholder="Nombre Talon">
      <input type="text" value="${columnaCounter}" class="numero-talon" onchange="actualizarIdTalon(${columnaCounter}, this.value)" placeholder="ID">
      <input type="text" value="corredor${columnaCounter}" class="nombre-usuario" onchange="actualizarNombreUsuario(${columnaCounter}, this.value)" placeholder="Corredor">
      <button class="delete-col-btn" onclick="eliminarColumna(${columnaCounter})" title="Eliminar columna">Eliminar</button>
    </div>
  `;
  thead.insertBefore(newTh, thAcciones);
  
  const rows = document.querySelectorAll("#tabla-body tr");
  rows.forEach(row => {
    const tdAcciones = row.lastElementChild;
    const newTd = document.createElement("td");
    const numeroFila = row.id.split('-')[1];
    newTd.innerHTML = `<input type="number" value="" class="form-control input-cell valor" data-col="${columnaCounter}" data-fila="${numeroFila}">`;
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
      <input type="number" id="prestamo-usuario${columnaCounter}" value="" class="form-control prestamo-input" onchange="recalcularConPrestamos()" placeholder="0">
      <button class="btn btn-sm btn-outline-primary prestamo-btn" onclick="agregarPrestamo(${columnaCounter})">+ Descuento</button>
      <div id="historial-prestamos${columnaCounter}" class="historial-container">
        <em>Sin descuentos</em>
      </div>
    </div>
  `;
  rows2[3].insertBefore(prestamoCelda, rows2[3].lastElementChild);
  
  const totalEmpresaCelda = document.createElement("td");
  totalEmpresaCelda.id = `total-empresa-individual${columnaCounter}`;
  totalEmpresaCelda.style.fontSize = "14px";
  totalEmpresaCelda.style.color = "#0066cc";
  totalEmpresaCelda.innerHTML = "<strong>0</strong>";
  rows2[6].insertBefore(totalEmpresaCelda, rows2[6].lastElementChild);
  
  const totalFinalCelda = document.createElement("td");
  totalFinalCelda.id = `total-final-usuario${columnaCounter}`;
  totalFinalCelda.style.fontSize = "16px";
  totalFinalCelda.style.color = "#28a745";
  totalFinalCelda.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
      <small style="font-size: 10px; font-weight: normal; color: #666;">corredor${columnaCounter}</small>
      <strong class="total-monto">0</strong>
    </div>
  `;
  rows2[7].insertBefore(totalFinalCelda, rows2[7].lastElementChild);
  
  agregarEventListeners();
  recalcular();
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
    
    const index = columnasData.findIndex((col, idx) => idx + 1 === colNum);
    if (index !== -1) {
      columnasData.splice(index, 1);
      historialesPrestamos.splice(index, 1);
    }
    
    recalcular();
  }
}

function actualizarNumeroTalon(col, valor) {
  if (columnasData[col - 1]) {
    columnasData[col - 1].numeroTalon = valor;
  }
}

function actualizarIdTalon(col, valor) {
  if (columnasData[col - 1]) {
    columnasData[col - 1].idTalon = valor;
  }
}

function actualizarNombreUsuario(col, valor) {
  if (columnasData[col - 1]) {
    columnasData[col - 1].nombreUsuario = valor;
    
    // Actualizar el nombre en la fila de totales
    const totalFinalEl = document.getElementById(`total-final-usuario${col}`);
    if (totalFinalEl) {
      const smallTag = totalFinalEl.querySelector('small');
      if (smallTag) {
        smallTag.textContent = valor;
      }
    }
  }
}

function agregarEventListeners() {
  document.querySelectorAll(".valor").forEach(input => {
    input.removeEventListener("input", recalcular);
    input.addEventListener("input", recalcular);
  });
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
  recalcularConDescuentosEmpresa();
  recalcularConGanancias();
}

function agregarPrestamo(usuario) {
  const prestamoInput = document.getElementById(`prestamo-usuario${usuario}`);
  const cantidadPrestamo = Number(prestamoInput.value);
  
  if (cantidadPrestamo > 0) {
    const descripcion = prompt(`Describe el descuento de ${cantidadPrestamo} para ${columnasData[usuario-1]?.nombreUsuario || 'corredor' + usuario}:`, 'Descuento del corredor');
    
    if (descripcion !== null) {
      const fecha = new Date().toLocaleDateString('es-MX');
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
    alert('Por favor, ingresa una cantidad mayor a 0 para el descuento.');
  }
}

function actualizarHistorialPrestamos(usuario) {
  const historialDiv = document.getElementById(`historial-prestamos${usuario}`);
  const prestamos = historialesPrestamos[usuario - 1];
  
  // Actualizar el total de descuentos
  const totalDescuentoEl = document.getElementById(`total-descuento-usuario${usuario}`);
  const totalDescuentos = prestamos.reduce((sum, p) => sum + p.cantidad, 0);
  if (totalDescuentoEl) {
    totalDescuentoEl.textContent = `Total: ${totalDescuentos}`;
  }
  
  if (prestamos.length === 0) {
    historialDiv.innerHTML = '<em>Sin descuentos</em>';
  } else {
    let html = '';
    prestamos.forEach((prestamo, index) => {
      html += `
        <div style="border-bottom: 1px solid #eee; padding: 2px 0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${prestamo.cantidad}</strong><br>
            <small>${prestamo.descripcion}</small><br>
          </div>
          <button onclick="eliminarPrestamo(${usuario}, ${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 1px 4px; font-size: 9px; cursor: pointer;" title="Eliminar descuento">X</button>
        </div>
      `;
    });
    historialDiv.innerHTML = html;
  }
}

function eliminarPrestamo(usuario, index) {
  if (confirm('¿Estás seguro de eliminar este descuento?')) {
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
      
      // Actualizar el monto dentro del strong con clase total-monto
      const totalMontoEl = totalFinalEl.querySelector('.total-monto');
      if (totalMontoEl) {
        totalMontoEl.innerText = totalFinal.toFixed(0);
        
        if (totalFinal < 0) {
          totalFinalEl.style.color = '#dc3545';
        } else {
          totalFinalEl.style.color = '#28a745';
        }
      } else {
        // Fallback para formato antiguo
        totalFinalEl.innerText = totalFinal.toFixed(0);
        
        if (totalFinal < 0) {
          totalFinalEl.style.color = '#dc3545';
        } else {
          totalFinalEl.style.color = '#28a745';
        }
      }
    }
  }
}

function agregarDescuentoEmpresa() {
  const descuentoInput = document.getElementById(`descuento-empresa-total`);
  const cantidadDescuento = Number(descuentoInput.value);
  
  if (cantidadDescuento > 0) {
    const descripcion = prompt(`Describe el descuento de ${cantidadDescuento} para la Empresa:`, 'Descuento de la empresa');
    
    if (descripcion !== null) {
      const fecha = new Date().toLocaleDateString('es-MX');
      const descuento = {
        cantidad: cantidadDescuento,
        descripcion: descripcion || 'Sin descripción',
        fecha: fecha
      };
      
      historialesDescuentosEmpresa.push(descuento);
      descuentoInput.value = 0;
      actualizarHistorialDescuentosEmpresa();
      recalcularConDescuentosEmpresa();
    }
  } else {
    alert('Por favor, ingresa una cantidad mayor a 0 para el descuento.');
  }
}

function actualizarHistorialDescuentosEmpresa() {
  const historialDiv = document.getElementById(`historial-descuentos-empresa`);
  
  if (historialesDescuentosEmpresa.length === 0) {
    historialDiv.innerHTML = '<em>Sin descuentos</em>';
  } else {
    let html = '';
    historialesDescuentosEmpresa.forEach((descuento, index) => {
      html += `
        <div style="border-bottom: 1px solid #eee; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>$${descuento.cantidad}</strong><br>
            <small>${descuento.descripcion}</small><br>
          </div>
          <button onclick="eliminarDescuentoEmpresa(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 1px 4px; font-size: 9px; cursor: pointer;" title="Eliminar descuento">X</button>
        </div>
      `;
    });
    historialDiv.innerHTML = html;
  }
}

function eliminarDescuentoEmpresa(index) {
  if (confirm('¿Estás seguro de eliminar este descuento?')) {
    historialesDescuentosEmpresa.splice(index, 1);
    actualizarHistorialDescuentosEmpresa();
    recalcularConDescuentosEmpresa();
  }
}

function recalcularConDescuentosEmpresa() {
  recalcularConGanancias();
}

function agregarGananciaEmpresa() {
  const gananciaInput = document.getElementById(`ganancia-empresa-total`);
  const cantidadGanancia = Number(gananciaInput.value);
  
  if (cantidadGanancia > 0) {
    const descripcion = prompt(`Describe la ganancia adicional de ${cantidadGanancia} para la Empresa:`, 'Ganancia adicional');
    
    if (descripcion !== null) {
      const fecha = new Date().toLocaleDateString('es-MX');
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
    historialDiv.innerHTML = '<em>Sin ganancias</em>';
  } else {
    let html = '';
    historialGananciasEmpresa.forEach((ganancia, index) => {
      html += `
        <div style="border-bottom: 1px solid #eee; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>$${ganancia.cantidad}</strong><br>
            <small>${ganancia.descripcion}</small><br>
          </div>
          <button onclick="eliminarGananciaEmpresa(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 1px 4px; font-size: 9px; cursor: pointer;" title="Eliminar ganancia">X</button>
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
  const descuentosTotales = historialesDescuentosEmpresa.reduce((sum, desc) => sum + desc.cantidad, 0);
  
  for (let j = 1; j <= columnaCounter; j++) {
    const resultadoCasaEl = document.getElementById("resultado-casa" + j);
    const totalEmpresaIndividualEl = document.getElementById("total-empresa-individual" + j);
    
    if (resultadoCasaEl && totalEmpresaIndividualEl) {
      const resultadoCasa = Number(resultadoCasaEl.innerText) || 0;
      const totalEmpresaIndividual = resultadoCasa;
      totalEmpresaConsolidado += totalEmpresaIndividual;
      totalEmpresaIndividualEl.innerText = totalEmpresaIndividual.toFixed(0);
    }
  }
  
   const totalFinal = totalEmpresaConsolidado + gananciasTotales - descuentosTotales - descuentoFantasma;
  
  const totalConsolidadoEl = document.getElementById("total-empresa-consolidado");
  if (totalConsolidadoEl) {
    totalConsolidadoEl.innerHTML = `<strong>TOTAL: ${totalFinal.toFixed(0)}</strong>`;
  }
  actualizarResumenEmpresa();
}

function actualizarResumenEmpresa() {
  const gananciasTotales = historialGananciasEmpresa.reduce((sum, ganancia) => sum + ganancia.cantidad, 0);
  const descuentosTotales = historialesDescuentosEmpresa.reduce((sum, desc) => sum + desc.cantidad, 0);
  
  let totalEmpresaCorredores = 0;
  for (let j = 1; j <= columnaCounter; j++) {
    const resultadoCasaEl = document.getElementById("resultado-casa" + j);
    if (resultadoCasaEl) {
      totalEmpresaCorredores += Number(resultadoCasaEl.innerText) || 0;
    }
  }
  
  // Aquí se incluye el descuento fantasma en el cálculo del total final
  const totalFinal = totalEmpresaCorredores + gananciasTotales - descuentosTotales - descuentoFantasma;
  
  // Actualizar valores en el resumen superior (tarjetas)
  const resumenGanancias = document.getElementById("resumen-ganancias");
  if (resumenGanancias) resumenGanancias.textContent = `$${gananciasTotales}`;
  
  // Aquí se suma el descuento fantasma al total de descuentos mostrado
  const resumenDescuentos = document.getElementById("resumen-descuentos");
  if (resumenDescuentos) resumenDescuentos.textContent = `$${(descuentosTotales + descuentoFantasma).toFixed(0)}`;
  
  const resumenTotalEmpresa = document.getElementById("resumen-total-empresa");
  if (resumenTotalEmpresa) resumenTotalEmpresa.textContent = `$${totalFinal.toFixed(0)}`;
  
  // Desglose detallado
  const resumenGananciasCorredores = document.getElementById("resumen-ganancias-corredores");
  if (resumenGananciasCorredores) resumenGananciasCorredores.textContent = `$${totalEmpresaCorredores.toFixed(0)}`;
  
  const resumenGananciasAdicionales = document.getElementById("resumen-ganancias-adicionales");
  if (resumenGananciasAdicionales) resumenGananciasAdicionales.textContent = `$${gananciasTotales}`;
  
  // Aquí también se suma el descuento fantasma
  const resumenDescuentosDetalle = document.getElementById("resumen-descuentos-detalle");
  if (resumenDescuentosDetalle) resumenDescuentosDetalle.textContent = `-$${(descuentosTotales + descuentoFantasma).toFixed(0)}`;
  
  const resumenBalanceFinal = document.getElementById("resumen-balance-final");
  if (resumenBalanceFinal) resumenBalanceFinal.textContent = `$${totalFinal.toFixed(0)}`;
  
  // Actualizar conceptos de ganancias
  const conceptosGananciasDiv = document.getElementById("resumen-conceptos-ganancias");
  if (conceptosGananciasDiv) {
    if (historialGananciasEmpresa.length === 0) {
      conceptosGananciasDiv.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; margin: 20px 0;">Sin ganancias registradas</p>';
    } else {
      let html = '';
      historialGananciasEmpresa.forEach((ganancia, index) => {
        html += `
          <div style="border-bottom: 1px solid #c3e6cb; padding: 10px 0; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #155724; font-size: 18px;">$${ganancia.cantidad}</span>
            </div>
            <p style="margin: 0; color: #495057; font-size: 13px;">${ganancia.descripcion}</p>
          </div>
        `;
      });
      conceptosGananciasDiv.innerHTML = html;
    }
  }
  
  // Actualizar conceptos de descuentos (SIN mostrar el descuento fantasma)
  const conceptosDescuentosDiv = document.getElementById("resumen-conceptos-descuentos");
  if (conceptosDescuentosDiv) {
    if (historialesDescuentosEmpresa.length === 0) {
      conceptosDescuentosDiv.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; margin: 20px 0;">Sin descuentos registrados</p>';
    } else {
      let html = '';
      historialesDescuentosEmpresa.forEach((descuento, index) => {
        html += `
          <div style="border-bottom: 1px solid #f5c6cb; padding: 10px 0; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #721c24; font-size: 18px;">$${descuento.cantidad}</span>
            </div>
            <p style="margin: 0; color: #495057; font-size: 13px;">${descuento.descripcion}</p>
          </div>
        `;
      });
      conceptosDescuentosDiv.innerHTML = html;
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
      mensajeBusqueda.innerHTML = `Pelea #${numeroBuscar} encontrada`;
    } else {
      fila.classList.add("fila-oculta");
    }
  });
  
  if (!filaEncontrada) {
    resultadoBusqueda.className = "alert alert-warning";
    mensajeBusqueda.innerHTML = `No se encontró la pelea #${numeroBuscar}`;
    
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

function aplicarDescuentoFantasma() {
  const cantidad = prompt('Ingresa el monto del descuento fantasma (no quedará registrado):');
  
  if (cantidad !== null && cantidad !== '') {
    const monto = Number(cantidad);
    if (!isNaN(monto) && monto >= 0) {
      descuentoFantasma = monto;
      recalcularConGanancias();
      alert(`Descuento fantasma de $${monto} aplicado correctamente`);
    } else {
      alert('Por favor ingresa un número válido');
    }
  }
}

function exportarExcel() {
  const datos = [];
  
  const nombreEvento = document.getElementById('nombre-evento').value || 'Evento sin nombre';
  const fechaEvento = document.getElementById('fecha-evento').value;
  
  datos.push(['INFORMACION DEL EVENTO']);
  datos.push(['Nombre del Evento:', nombreEvento]);
  datos.push(['Fecha:', fechaEvento]);
  datos.push([]);
  datos.push([]);
  
  const encabezados = ['Ganador', 'Numero de Pelea'];
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
  
  const filaPrestamos = ['Descuentos del corredor', ''];
  for (let j = 1; j <= columnaCounter; j++) {
    let totalPrestamos = 0;
    if (historialesPrestamos[j - 1]) {
      totalPrestamos = historialesPrestamos[j - 1].reduce((sum, p) => sum + p.cantidad, 0);
    }
    filaPrestamos.push(totalPrestamos);
  }
  datos.push(filaPrestamos);
  
  // Agregar detalle de descuentos por corredor
  for (let j = 1; j <= columnaCounter; j++) {
    if (historialesPrestamos[j - 1] && historialesPrestamos[j - 1].length > 0) {
      datos.push([`Detalle ${columnasData[j-1]?.nombreUsuario || 'corredor'+j}`, '']);
      historialesPrestamos[j - 1].forEach(prestamo => {
        datos.push(['', `${prestamo.cantidad} - ${prestamo.descripcion} (${prestamo.fecha})`]);
      });
    }
  }
  
  datos.push([]);
  
  const descuentoEmpresaTotal = historialesDescuentosEmpresa.reduce((sum, d) => sum + d.cantidad, 0);
  datos.push(['Descuentos de la Empresa', descuentoEmpresaTotal]);
  
  // Agregar detalle de descuentos de empresa
  if (historialesDescuentosEmpresa.length > 0) {
    datos.push(['Detalle Descuentos Empresa', '']);
    historialesDescuentosEmpresa.forEach(descuento => {
      datos.push(['', `${descuento.cantidad} - ${descuento.descripcion} (${descuento.fecha})`]);
    });
  }
  
  datos.push([]);
  
  const gananciaEmpresaTotal = historialGananciasEmpresa.reduce((sum, g) => sum + g.cantidad, 0);
  datos.push(['Ganancias Adicionales Empresa', gananciaEmpresaTotal]);
  
  // Agregar detalle de ganancias de empresa
  if (historialGananciasEmpresa.length > 0) {
    datos.push(['Detalle Ganancias Empresa', '']);
    historialGananciasEmpresa.forEach(ganancia => {
      datos.push(['', `${ganancia.cantidad} - ${ganancia.descripcion} (${ganancia.fecha})`]);
    });
  }
  
  datos.push([]);
  
  const filaTotalEmpresa = ['TOTAL GANANCIAS EMPRESA', ''];
  for (let j = 1; j <= columnaCounter; j++) {
    const totalEl = document.getElementById("total-empresa-individual" + j);
    filaTotalEmpresa.push(totalEl ? Number(totalEl.innerText) : 0);
  }
  const totalConsolidado = document.getElementById("total-empresa-consolidado").textContent.replace('TOTAL:', '').trim();
  filaTotalEmpresa.push(totalConsolidado);
  datos.push(filaTotalEmpresa);
  
  const filaTotalFinal = ['TOTAL FINAL CORREDOR', ''];
  for (let j = 1; j <= columnaCounter; j++) {
    const totalEl = document.getElementById("total-final-usuario" + j);
    if (totalEl) {
      const totalMontoEl = totalEl.querySelector('.total-monto');
      const valor = totalMontoEl ? Number(totalMontoEl.innerText) : Number(totalEl.innerText);
      filaTotalFinal.push(valor || 0);
    } else {
      filaTotalFinal.push(0);
    }
  }
  datos.push(filaTotalFinal);
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(datos);
  
  const wscols = [
    {wch: 20},
    {wch: 18}
  ];
  for (let i = 0; i < columnaCounter; i++) {
    wscols.push({wch: 15});
  }
  ws['!cols'] = wscols;
  
  XLSX.utils.book_append_sheet(wb, ws, "Peleas");
  XLSX.writeFile(wb, `Registro_Peleas_${nombreEvento}_${fechaEvento}.xlsx`);
}

function sincronizarScrolls() {
  const scrollSuperior = document.getElementById('scroll-superior');
  const tablaContainer = document.getElementById('tabla-container');
  const scrollContent = document.getElementById('scroll-content');
  const tabla = document.getElementById('tabla');
  
  if (!scrollSuperior || !tablaContainer || !scrollContent || !tabla) return;
  
  function ajustarAncho() {
    scrollContent.style.width = tabla.scrollWidth + 'px';
  }
  
  scrollSuperior.addEventListener('scroll', function() {
    tablaContainer.scrollLeft = scrollSuperior.scrollLeft;
  });
  
  tablaContainer.addEventListener('scroll', function() {
    scrollSuperior.scrollLeft = tablaContainer.scrollLeft;
  });
  
  ajustarAncho();
  window.addEventListener('resize', ajustarAncho);
  
  const observer = new MutationObserver(ajustarAncho);
  observer.observe(tabla, { childList: true, subtree: true });
}

window.onload = function() {
  inicializarTabla();
  sincronizarScrolls();
};
