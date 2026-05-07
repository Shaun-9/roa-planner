const DataClient = (() => {
  async function getMembers() {
    if (APP_CONFIG.DATA_SOURCE === "sharepoint") {
      return SharePointClient.getMembers();
    }
    return Promise.resolve(MOCK_DATA.members.filter(m => m.is_active));
  }

  async function getMember(serviceNumber) {
    if (APP_CONFIG.DATA_SOURCE === "sharepoint") {
      return SharePointClient.getMember(serviceNumber);
    }
    const member = MOCK_DATA.members.find(m => m.service_number === serviceNumber);
    return Promise.resolve(member || null);
  }

  async function getAppointments() {
    if (APP_CONFIG.DATA_SOURCE === "sharepoint") {
      return SharePointClient.getAppointments();
    }
    return Promise.resolve(MOCK_DATA.appointments);
  }

  return { getMembers, getMember, getAppointments };
})();
