import {
    OpenStreetMapProvider
} from 'leaflet-geosearch';
const provider = new OpenStreetMapProvider();

document.addEventListener('DOMContentLoaded', () => {

    if (document.querySelector('#mapa')) {
        const lat = -11.993183028815567;
        const lng = -77.01235236358905;

        const mapa = L.map('mapa').setView([lat, lng], 16);

        //Eliminar pines previos
        let markers = new L.FeatureGroup().addTo(mapa);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        let marker;

        // agregar el pin
        marker = new L.marker([lat, lng], {
            draggable: true,
            autoPan: true
        }).addTo(mapa);

        //Agregar el pin  a las capas
        markers.addLayer(marker)

        //Geocode service
        const geocodeService = L.esri.Geocoding.geocodeService();

        //Buscador de direcciones
        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('blur', buscarDireccion);

        reubicarPin(marker)

        function reubicarPin(marker) {
            //Detectar movimiento del marker
            marker.on('moveend', function (e) {
                marker = e.target;

                const posicion = marker.getLatLng();

                //Centrar automaticamente
                mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

                //Reverse Geocoding, cuando el usuario reubica el pin
                geocodeService.reverse().latlng(posicion, 16).run(function (error, resultado) {
                    /* console.log(error); */
                    console.log(resultado.address);

                    marker.bindPopup(resultado.address.LongLabel);
                    marker.openPopup();

                    //llenar los campos
                    llenarInputs(resultado);
                })


            })
        }



        function llenarInputs(resultado) {
            document.querySelector('#direccion').value = resultado.address.Address || '';
            document.querySelector('#urbanizacion').value = resultado.address.Neighborhood || '';
            document.querySelector('#lat').value = resultado.latlng.lat || '';
            document.querySelector('#lng').value = resultado.latlng.lng || '';

        }

        function buscarDireccion(e) {


            if (e.target.value.length > 5) {
                provider.search({
                        query: e.target.value + ' Lima PE '
                    })
                    .then(resultado => {
                        if (resultado) {

                            //Limpiar los pines previos
                            markers.clearLayers();
                            //Reverse Geocoding, cuando el usuario reubica el pin
                            geocodeService.reverse().latlng(resultado[0].bounds[0], 16).run(function (error, resultado) {
                                //llenar los inputs
                                llenarInputs(resultado);

                                //Centrar el mapa
                                mapa.setView(resultado.latlng)

                                //Agregar el pin
                                marker = new L.marker(resultado.latlng, {
                                    draggable: true,
                                    autoPan: true
                                }).addTo(mapa);

                                //asignar el contenerdo del marker al nuevo pin
                                markers.addLayer(marker)

                                //Mover el Pin
                                reubicarPin(marker)
                            })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            };
        }

    }

});
