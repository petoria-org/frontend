import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";

// small helper component to handle clicks
function ClickHandler({ setPoint }) {
  useMapEvents({
    click(e) { setPoint([e.latlng.lat, e.latlng.lng]); }
  });
  return null;
}

export default function MapPicker({ initialPoint = [35.7, 51.4], onSaveUrl = "/api/locations/" }) {
  const [point, setPoint] = useState(initialPoint); // [lat, lon]
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState({ country: "", city: "", district: "" });
  const [loading, setLoading] = useState(false);

  // reverse geocode when point changes
  useEffect(() => {
    async function rev() {
      setLoading(true);
      try {
        // Prefer calling your backend geocode endpoint; fallback: Nominatim
        const res = await axios.get(`/api/geocode/reverse?lat=${point[0]}&lon=${point[1]}`);
        // backend should return an object: { country, city, district }
        setAddress(res.data);
      } catch (err) {
        // fallback to Nominatim (public)
        try {
          const res2 = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: { lat: point[0], lon: point[1], format: "json", addressdetails: 1 }
          });
          const a = res2.data.address || {};
          setAddress({
            country: a.country || "",
            city: a.city || a.town || a.village || "",
            district: a.suburb || a.neighbourhood || a.district || ""
          });
        } catch (e) { /* ignore */ }
      } finally { setLoading(false); }
    }
    rev();
  }, [point]);

  // forward geocode (search)
  async function doSearch() {
    if (!query) return;
    setLoading(true);
    try {
      // prefer backend endpoint, or use Nominatim directly:
      const res = await axios.get(`/api/geocode/forward?q=${encodeURIComponent(query)}`);
      // backend returns array of matches [{lat, lon, display, address:{}}]
      const first = res.data?.[0];
      if (first) setPoint([first.lat, first.lon]);
    } catch (err) {
      try {
        const r2 = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: query, format: "json", addressdetails: 1, limit: 5 }
        });
        const first = r2.data?.[0];
        if (first) setPoint([parseFloat(first.lat), parseFloat(first.lon)]);
      } catch (e) {}
    } finally { setLoading(false); }
  }

  // save to backend
  async function save() {
    const payload = {
      country: address.country,
      city: address.city,
      district: address.district,
      // send point as GeoJSON: [lon, lat]
      point: { type: "Point", coordinates: [point[1], point[0]] }
    };
    try {
      const res = await axios.post(onSaveUrl, payload);
      alert("Saved!");
      return res.data;
    } catch (e) {
      console.error(e);
      alert("Save failed");
    }
  }

  return (
    <div className="w-full h-[60vh] flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Search for address or place"
          className="border p-2 flex-1"
        />
        <button onClick={doSearch} className="px-4 py-2 border">Search</button>
        <button onClick={save} className="px-4 py-2 bg-slate-700 text-white">Save</button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <MapContainer center={initialPoint} zoom={13} style={{height: "400px", width: "100%"}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler setPoint={setPoint} />
            <Marker position={point} />
          </MapContainer>
        </div>

        <div className="w-64 p-2 border">
          <div><strong>Lat</strong>: {point[0].toFixed(6)}</div>
          <div><strong>Lon</strong>: {point[1].toFixed(6)}</div>
          <hr className="my-2"/>
          <div><strong>Country:</strong> {address.country}</div>
          <div><strong>City:</strong> {address.city}</div>
          <div><strong>District:</strong> {address.district}</div>
          {loading && <div className="mt-2">Loading…</div>}
        </div>
      </div>
    </div>
  );
}
