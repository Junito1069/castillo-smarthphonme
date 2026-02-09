import { db } from "./firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaProductos");
const brandHeader = document.getElementById("brandHeader");
const marca = localStorage.getItem("marcaActual");

if (!marca) {
    alert("No se seleccionó ninguna marca.");
    window.location.href = "index.html";
} else {
    cargarImagenMarca(marca);
    cargarProductos();
}

/* ===== IMAGEN POR MARCA ===== */
function cargarImagenMarca(marca) {
    const imagenes = {
        iphone: "url('iphone.png')",
        samsung: "url('samsung.png')",
        pixel: "url('pixle.png')"
    };

    if (imagenes[marca]) {
        brandHeader.style.backgroundImage = imagenes[marca];
    }
}

/* ===== CARGAR + ORDENAR ===== */
async function cargarProductos() {
    lista.innerHTML = "";

    try {
        const q = query(collection(db, "productos"), where("marca", "==", marca));
        const snapshot = await getDocs(q);

        let productos = [];
        snapshot.forEach(docu => productos.push(docu.data()));

        productos.sort((a, b) => {

            /* 1️⃣ MODELO */
            if (a.modelo !== b.modelo) {
                return a.modelo.localeCompare(b.modelo);
            }

            /* 2️⃣ GB (MENOR → MAYOR) */
            const gbA = parseInt(a.gb);
            const gbB = parseInt(b.gb);
            if (gbA !== gbB) {
                return gbA - gbB;
            }

            /* 3️⃣ CONDICIÓN (solo si GB se repite) */
            const prioridad = {
                "Como Nuevo": 1,
                "Como N": 1,
                "CN": 1,
                "A": 2,
                "B": 3
            };

            return (prioridad[a.condicion] || 9) -
                   (prioridad[b.condicion] || 9);
        });

        /* ===== RENDER ===== */
        productos.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.modelo}</td>
                <td>${p.gb}</td>
                <td>${p.condicion}</td>
                <td>$${Number(p.precio).toLocaleString("en-US")}</td>
            `;
            lista.appendChild(tr);
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}
