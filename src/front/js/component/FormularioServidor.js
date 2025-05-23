import React, { useState, useEffect } from "react";

const FormularioServidor = ({ servidorInicial, setServidores, setModalVisible, onSuccess, esEdicion }) => {
    const [servicios, setServicios] = useState([]);
    const [capas, setCapas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [dominios, setDominios] = useState([]);
    const [sistemasOperativos, setSistemasOperativos] = useState([]);
    const [estatus, setEstatus] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "",
        ip: "",
        balanceador: "",
        vlan: "",
        descripcion: "",
        link: "",
        servicio_id: "",
        capa_id: "",
        ambiente_id: "",
        dominio_id: "",
        sistema_operativo_id: "",
        estatus_id: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urls = [
                    { name: "servicios", url: "http://localhost:3001/api/servicios" },
                    { name: "capas", url: "http://localhost:3001/api/capas" },
                    { name: "ambientes", url: "http://localhost:3001/api/ambientes" },
                    { name: "dominios", url: "http://localhost:3001/api/dominios" },
                    { name: "sistemasOperativos", url: "http://localhost:3001/api/sistemas_operativos" },
                    { name: "estatus", url: "http://localhost:3001/api/estatus" }
                ];

                const responses = await Promise.all(urls.map(({ name, url }) =>
                    fetch(url)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`Error en ${name}: ${res.status} ${res.statusText}`);
                            }
                            return res.json();
                        })
                        .catch(err => {
                            console.error(`Error al obtener ${name}:`, err);
                            return [];
                        })
                ));

                setServicios(responses[0]);
                setCapas(responses[1]);
                setAmbientes(responses[2]);
                setDominios(responses[3]);
                setSistemasOperativos(responses[4]);
                setEstatus(responses[5]);

                setError(null);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();

        if (esEdicion && servidorInicial) {
            setFormData({
                nombre: servidorInicial.nombre || "",
                tipo: servidorInicial.tipo || "",
                ip: servidorInicial.ip || "",
                balanceador: servidorInicial.balanceador || "",
                vlan: servidorInicial.vlan || "",
                descripcion: servidorInicial.descripcion || "",
                link: servidorInicial.link || "",
                servicio_id: servidorInicial.servicio?.id || "",
                capa_id: servidorInicial.capa?.id || "",
                ambiente_id: servidorInicial.ambiente?.id || "",
                dominio_id: servidorInicial.dominio?.id || "",
                sistema_operativo_id: servidorInicial.sistema_operativo?.id || "",
                estatus_id: servidorInicial.estatus?.id || ""
            });
        }
    }, [servidorInicial, esEdicion]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // 🔹 Validación de campos obligatorios antes de enviar la solicitud
        const requiredFields = [
            "nombre", "tipo", "ip", "balanceador", "vlan", "descripcion",
            "link", "servicio_id", "capa_id", "ambiente_id", "dominio_id",
            "sistema_operativo_id", "estatus_id"
        ];

        const missingFields = requiredFields.filter(field => !formData[field] || formData[field] === "");

        if (missingFields.length > 0) {
            setError(`Faltan datos obligatorios: ${missingFields.join(", ")}`);
            return;
        }

        const payload = {
            nombre: formData.nombre,
            tipo: formData.tipo,
            ip: formData.ip,
            balanceador: formData.balanceador,
            vlan: formData.vlan,
            descripcion: formData.descripcion,
            link: formData.link,
            servicio_id: formData.servicio_id,
            capa_id: formData.capa_id,
            ambiente_id: formData.ambiente_id,
            dominio_id: formData.dominio_id,
            sistema_operativo_id: formData.sistema_operativo_id,
            estatus_id: formData.estatus_id
        };

        console.log("Datos enviados al backend:", payload);

        try {
            const response = await fetch(
                esEdicion
                    ? `http://localhost:3001/api/servidores/${servidorInicial?.id}`
                    : "http://localhost:3001/api/servidores",
                {
                    method: esEdicion ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
            }

            const servidorActualizado = await response.json();
            const responseServidores = await fetch("http://localhost:3001/api/servidores");
            const servidoresActualizados = await responseServidores.json();
            setServidores(servidoresActualizados);

            setModalVisible(false);
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(esEdicion ? "✅ Servidor editado correctamente!" : "✅ Servidor guardado exitosamente!");
                }, 100);
            }
        } catch (error) {
            setError(error.message);
        }
    };
    return (
        <form onSubmit={handleFormSubmit} className="grid-form">
            {error && <div className="error-message">{error}</div>}

            {/* Fila 1 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="">Seleccione el Tipo</option>
                        <option value="FISICO">FISICO</option>
                        <option value="VIRTUAL">VIRTUAL</option>
                    </select>
                </div>
                <div className="form-field">
                    <label>IP</label>
                    <input type="text" name="ip" value={formData.ip} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Balanceador</label>
                    <input type="text" name="balanceador" value={formData.balanceador} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>VLAN</label>
                    <input type="text" name="vlan" value={formData.vlan} onChange={handleChange} required />
                </div>
            </div>

            {/* Fila 2 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required></textarea>
                </div>
                <div className="form-field">
                    <label>Link</label>
                    <input type="text" name="link" value={formData.link} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Servicio</label>
                    <select name="servicio_id" value={formData.servicio_id} onChange={handleChange} required>
                        <option value="">Seleccione un Servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Capa</label>
                    <select name="capa_id" value={formData.capa_id} onChange={handleChange} required>
                        <option value="">Seleccione una Capa</option>
                        {capas.map(capa => (
                            <option key={capa.id} value={capa.id}>{capa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Ambiente</label>
                    <select name="ambiente_id" value={formData.ambiente_id} onChange={handleChange} required>
                        <option value="">Seleccione un Ambiente</option>
                        {ambientes.map(ambiente => (
                            <option key={ambiente.id} value={ambiente.id}>{ambiente.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Fila 3 */}
            <div className="grid-form-row">
                <div className="form-field">
                    <label>Dominio</label>
                    <select name="dominio_id" value={formData.dominio_id} onChange={handleChange} required>
                        <option value="">Seleccione un Dominio</option>
                        {dominios.map(dominio => (
                            <option key={dominio.id} value={dominio.id}>{dominio.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Sistema Operativo</label>
                    <select name="sistema_operativo_id" value={formData.sistema_operativo_id} onChange={handleChange} required>
                        <option value="">Seleccione un S.O.</option>
                        {sistemasOperativos.map(so => (
                            <option key={so.id} value={so.id}>{so.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Estatus</label>
                    <select name="estatus_id" value={formData.estatus_id} onChange={handleChange} required>
                        <option value="">Seleccione un Estatus</option>
                        {estatus.map(est => (
                            <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Acciones */}
            <div className="modal-buttons">
                <button type="submit" className="guardar-servidores-btn">Guardar</button>
                <button type="button" className="cerrar-servidores-btn" onClick={() => setModalVisible(false)}>Cerrar</button>
            </div>
        </form>
    );
};

export default FormularioServidor;