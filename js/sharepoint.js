const SharePointClient = (() => {
  let siteId = null;

  async function graphFetch(path) {
    const token = await AuthClient.getToken();
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
    return response.json();
  }

  async function getSiteId() {
    if (siteId) return siteId;
    const url = new URL(APP_CONFIG.SP_SITE_URL);
    const hostname = url.hostname;
    const sitePath = url.pathname;
    const data = await graphFetch(`/sites/${hostname}:${sitePath}`);
    siteId = data.id;
    return siteId;
  }

  async function getListItems(listName) {
    const id = await getSiteId();
    let url = `/sites/${id}/lists/${listName}/items?expand=fields&$top=999`;
    const items = [];

    while (url) {
      const data = await graphFetch(url);
      items.push(...(data.value || []));
      url = data["@odata.nextLink"] ? data["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "") : null;
    }

    return items.map(i => i.fields);
  }

  function normaliseDate(val) {
    if (!val) return null;
    return val.split("T")[0];
  }

  async function getMembers() {
    const raw = await getListItems(APP_CONFIG.LIST_MEMBERS);
    return raw
      .filter(f => f.IsActive)
      .map(f => ({
        service_number: f.ServiceNumber,
        name: f.Title,
        current_rank: f.CurrentRank,
        rank_date: normaliseDate(f.RankDate),
        service_start_date: normaliseDate(f.ServiceStartDate),
        specialisation: f.Specialisation,
        current_appointment: f.CurrentAppointment,
        appointment_start_date: normaliseDate(f.AppointmentStartDate),
        aspiration: f.Aspiration,
        potential_rating: f.PotentialRating,
        supervisor_notes: f.SupervisorNotes,
        end_of_service_date: normaliseDate(f.EndOfServiceDate),
        is_active: !!f.IsActive
      }));
  }

  async function getMember(serviceNumber) {
    const members = await getMembers();
    return members.find(m => m.service_number === serviceNumber) || null;
  }

  async function getAppointments() {
    const raw = await getListItems(APP_CONFIG.LIST_APPOINTMENTS);
    return raw.map(f => ({
      id: f.id || f.Title,
      title: f.Title,
      min_rank: f.MinRank,
      max_rank: f.MaxRank,
      specialisation: f.Specialisation,
      category: f.Category,
      duration_months: parseInt(f.DurationMonths, 10),
      aspiration_tags: (f.AspirationTags || "").split(",").map(s => s.trim()).filter(Boolean)
    }));
  }

  return { getMembers, getMember, getAppointments };
})();
