export interface Dictionary {
  common: {
    back: string;
    confirm: string;
    cancel: string;
    loading: string;
    hospital_name: string;
    hospital_sub: string;
  };
  landing: {
    system_name: string;
    for_patient: string;
    for_patient_desc: string;
    patient_btn: string;
    for_staff: string;
    for_staff_desc: string;
    staff_btn: string;
  };
  patient_vn: {
    title: string;
    subtitle: string;
    label_vn: string;
    label_phone: string;
    placeholder_vn: string;
    placeholder_phone: string;
    check_btn: string;
    error_not_found: string;
    error_fill: string;
  };
  status: {
    waiting: string;
    called: string;
    completed: string;
    skipped: string;
    your_queue: string;
    room: string;
    queue_count: string;
    please_wait: string;
  };
  patient_status: {
    last_update: string;
    sound_on: string;
    sound_off: string;
    timeline_title: string;
    alert_called_title: string;
    alert_called_message: string;
    alert_skipped_title: string;
    alert_skipped_message: string;
    alert_near_title: string;
    alert_near_message: string;
  };
  footer: {
    notice_title: string;
    notice_desc: string;
    contact_staff: string;
  };
  directions: {
    URO: string;
    PED: string;
    OBG: string;
    NCD: string;
    SPM: string;
    DIA: string;
    MED: string;
    EYE: string;
    DEN: string;
    ENT: string;
    SPC: string;
  };
}
