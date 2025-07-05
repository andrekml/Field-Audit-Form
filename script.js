/* ---------- DATA STORE ---------- */
const records = [];   // In-memory array

/* ---------- HELPERS ---------- */
/** Convert decimal degrees to DDMMSS.SSS (string) */
function toDMS(dec){
  const sign = dec < 0 ? '-' : '';
  const abs  = Math.abs(dec);
  const deg  = Math.floor(abs);
  const minF = (abs - deg) * 60;
  const min  = Math.floor(minF);
  const sec  = ((minF - min) * 60).toFixed(3);
  return `${sign}${String(deg).padStart(2,'0')}${String(min).padStart(2,'0')}${sec.padStart(6,'0')}`;
}

/* ---------- GPS BUTTON ---------- */
document.getElementById('gpsBtn').onclick = () => {
  if(!navigator.geolocation){
    alert('Geolocation is not supported on this device.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      document.getElementById('lat').value = toDMS(pos.coords.latitude);
      document.getElementById('lon').value = toDMS(pos.coords.longitude);
    },
    err=> alert('GPS Error: ' + err.message),
    { enableHighAccuracy:true, timeout:10000 }
  );
};

/* ---------- FORM SUBMIT ---------- */
document.getElementById('captureForm').addEventListener('submit', function(e){
  e.preventDefault();

  // 1. Collect entries
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // 2. Format date → YYYY/MM/DD
  if(data.date){
    const d = new Date(data.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    data.date = `${yyyy}/${mm}/${dd}`;
  }

  // 3. Store
  records.push(data);
  alert('Data saved ✔');

  // 4. Reset for next entry
  this.reset();
});

/* ---------- EXCEL EXPORT ---------- */
document.getElementById('exportBtn').addEventListener('click', ()=>{
  if(records.length === 0){
    alert('No data to export.');
    return;
  }

  /* 1️⃣ Header mapping */
  const map = {
    workorderNo:"Workorder No", zone:"Zone", sector:"Sector", cnc:"CNC",
    contractorName:"Contractor Name", date:"Date", feederName:"Feeder Name",
    townshipName:"Township Name", transformerNo:"Transformer No", standNo:"Stand No",
    installationNo:"Installation No", latitude:"Latitude", longitude:"Longitude",
    access:"Access", atHome:"At Home", connected:"Connected", abandoned:"Abandoned",
    vandalised:"Vandalised", illegal:"Illegal", owner:"Owner", surname:"Surname",
    name:"Name", idNo:"ID No", phoneCode:"Phone Code", phoneNo:"Phone No",
    normalVendor:"Normal Vendor", recentVendor:"Most Recent Vendor", meterNo:"Meter No",
    split:"Split", commonBaseMeter:"Common/Non Common Base Meter", edEcu:"ED/ECU",
    meterType:"Meter Type", tariffCode:"Tariff Code", ampLimit:"Amp Limit",
    supplyGroupCode:"Supply Group Code", magCard:"Mag Card/Keypad", stsOrProp:"STS or Prop",
    tampered:"Tampered", tamperMethod:"Tamper Method", removed:"Removed",
    tamperNotNo:"Tamper Not No", cardTrip:"Card Trip", elTest:"E/L Test",
    meterFaulty:"Meter Faulty", replaced:"Replaced", mmfNo:"MMF No",
    newMeterNo:"New Meter No", newMeterType:"New Meter Type",
    newMeterAmpLimit:"New Meter Amp Limit", newMeterCardTrip:"New Meter Card Trip",
    newMeterElTest:"New Meter E/L Test", sealed:"Sealed", sealNo:"Seal No",
    remarks:"Remarks"
  };

  /* 2️⃣ Transform records into pretty headers */
  const formatted = records.map(rec=>{
    const obj = {};
    for(const k in rec){
      obj[map[k] || k] = rec[k];
    }
    return obj;
  });

  /* 3️⃣ SheetJS export */
  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, 'Field_Data.xlsx');
});
