// Initialize and add the map
function initMap() {
    // The location of Uluru
    const home = { lat: -34.38978956946109, lng: -58.86374320162155 };
    const dorrego = { lat: -38.718267352501144, lng: -61.28871124815555 };
    const monte = { lat: -38.9834539722108, lng: -61.308120159058994 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 1,
      center: home,
    });
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: home,
      map: map,
    } );
   
    const marker2 = new google.maps.Marker({
        position: dorrego,
        map: map,
      } );

      const marker3 = new google.maps.Marker({
        position: monte,
        map: map,
      } );

}

    
    
  
    
   
  window.initMap = initMap;

  /*-34.38978956946109, -58.86374320162155 */

  /*-38.718267352501144, -61.28871124815555*/

  /*-38.9834539722108, -61.308120159058994*/