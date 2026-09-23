import SmartAttendanceConfig from '../models/SmartAttendanceConfig.js';

/**
 * @desc    Get smart attendance config
 * @route   GET /api/attendance/smart/config
 */
export const getSmartConfig = async (req, res) => {
  try {
    let config = await SmartAttendanceConfig.findOne();
    if (!config) {
      config = await SmartAttendanceConfig.create({
        isEnabled: true,
        enabled: true,
        geofenceEnabled: true,
        geofencingEnabled: true,
        wifiEnabled: true,
        autoPunchIn: true,
        autoPunchOut: true,
        verificationMode: 'either',
        defaultRadiusMeters: 50,
        officeLocations: [
          {
            officeId: 'OFF001',
            name: 'Jaipur Head Office',
            latitude: 26.9124,
            longitude: 75.7873,
            radiusMeters: 50,
            radius: 50,
            address: 'Malviya Nagar, Jaipur, Rajasthan - 302017',
            status: 'active',
            isActive: true,
          },
        ],
        wifiNetworks: [
          {
            wifiId: 'WIFI001',
            name: 'Office Main WiFi',
            ssid: 'SKYWORK_OFFICE_JAIPUR',
            password: 'SkyworkSecure@2026',
            officeId: 'OFF001',
            officeName: 'Jaipur Head Office',
            status: 'active',
            isActive: true,
          },
        ],
      });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching smart config:', error);
    res.status(500).json({ success: false, message: 'Server error fetching config.' });
  }
};

/**
 * @desc    Update smart attendance config
 * @route   PUT /api/attendance/smart/config
 */
export const updateSmartConfig = async (req, res) => {
  try {
    let config = await SmartAttendanceConfig.findOne();
    if (!config) {
      config = new SmartAttendanceConfig(req.body);
    } else {
      Object.keys(req.body).forEach((key) => {
        if (key !== '_id' && key !== '__v') {
          config[key] = req.body[key];
        }
      });
    }
    await config.save();
    res.json({ success: true, message: 'Smart attendance config updated.', data: config });
  } catch (error) {
    console.error('Error updating smart config:', error);
    res.status(500).json({ success: false, message: 'Server error updating config.' });
  }
};

/**
 * @desc    Add office location
 * @route   POST /api/attendance/smart/offices
 */
export const addOffice = async (req, res) => {
  try {
    let config = await SmartAttendanceConfig.findOne();
    if (!config) {
      config = await SmartAttendanceConfig.create({});
    }

    const office = {
      officeId: req.body.officeId || req.body.id || `OFF-${Date.now()}`,
      name: req.body.name,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      radiusMeters: Number(req.body.radius || req.body.radiusMeters || 50),
      radius: Number(req.body.radius || req.body.radiusMeters || 50),
      address: req.body.address || '',
      status: req.body.status || 'active',
      isActive: req.body.status !== 'inactive',
      createdAt: new Date(),
    };

    config.officeLocations.push(office);
    await config.save();

    res.status(201).json({ success: true, message: 'Office added.', data: config });
  } catch (error) {
    console.error('Error adding office:', error);
    res.status(500).json({ success: false, message: 'Server error adding office.' });
  }
};

/**
 * @desc    Update office location
 * @route   PUT /api/attendance/smart/offices/:id
 */
export const updateOffice = async (req, res) => {
  try {
    const config = await SmartAttendanceConfig.findOne();
    if (!config) {
      return res.status(404).json({ success: false, message: 'Smart config not found.' });
    }

    const { id } = req.params;
    const officeIndex = config.officeLocations.findIndex(
      (o) => o.officeId === id || o._id.toString() === id || (o.id && o.id === id)
    );

    if (officeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Office location not found.' });
    }

    const existing = config.officeLocations[officeIndex];
    if (req.body.name) existing.name = req.body.name;
    if (req.body.latitude !== undefined) existing.latitude = Number(req.body.latitude);
    if (req.body.longitude !== undefined) existing.longitude = Number(req.body.longitude);
    if (req.body.radius !== undefined || req.body.radiusMeters !== undefined) {
      const r = Number(req.body.radius || req.body.radiusMeters);
      existing.radius = r;
      existing.radiusMeters = r;
    }
    if (req.body.address !== undefined) existing.address = req.body.address;
    if (req.body.status !== undefined) {
      existing.status = req.body.status;
      existing.isActive = req.body.status === 'active';
    }

    await config.save();
    res.json({ success: true, message: 'Office updated.', data: config });
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({ success: false, message: 'Server error updating office.' });
  }
};

/**
 * @desc    Delete office location
 * @route   DELETE /api/attendance/smart/offices/:id
 */
export const deleteOffice = async (req, res) => {
  try {
    const config = await SmartAttendanceConfig.findOne();
    if (!config) {
      return res.status(404).json({ success: false, message: 'Smart config not found.' });
    }

    const { id } = req.params;
    config.officeLocations = config.officeLocations.filter(
      (o) => o.officeId !== id && o._id.toString() !== id && o.id !== id
    );

    await config.save();
    res.json({ success: true, message: 'Office deleted.', data: config });
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({ success: false, message: 'Server error deleting office.' });
  }
};

/**
 * @desc    Add Wi-Fi network config
 * @route   POST /api/attendance/smart/wifi-configs
 */
export const addWifiConfig = async (req, res) => {
  try {
    let config = await SmartAttendanceConfig.findOne();
    if (!config) {
      config = await SmartAttendanceConfig.create({});
    }

    const wifi = {
      wifiId: req.body.wifiId || req.body.id || `WIFI-${Date.now()}`,
      name: req.body.name || req.body.ssid,
      ssid: req.body.ssid,
      password: req.body.password || '',
      bssid: req.body.bssid || '',
      officeId: req.body.officeId || '',
      officeName: req.body.officeName || '',
      status: req.body.status || 'active',
      isActive: req.body.status !== 'inactive',
      createdAt: new Date(),
    };

    config.wifiNetworks.push(wifi);
    await config.save();

    res.status(201).json({ success: true, message: 'Wi-Fi config added.', data: config });
  } catch (error) {
    console.error('Error adding Wi-Fi config:', error);
    res.status(500).json({ success: false, message: 'Server error adding Wi-Fi config.' });
  }
};

/**
 * @desc    Update Wi-Fi network config
 * @route   PUT /api/attendance/smart/wifi-configs/:id
 */
export const updateWifiConfig = async (req, res) => {
  try {
    const config = await SmartAttendanceConfig.findOne();
    if (!config) {
      return res.status(404).json({ success: false, message: 'Smart config not found.' });
    }

    const { id } = req.params;
    const wifiIndex = config.wifiNetworks.findIndex(
      (w) => w.wifiId === id || w._id.toString() === id || (w.id && w.id === id)
    );

    if (wifiIndex === -1) {
      return res.status(404).json({ success: false, message: 'Wi-Fi config not found.' });
    }

    const existing = config.wifiNetworks[wifiIndex];
    if (req.body.name) existing.name = req.body.name;
    if (req.body.ssid) existing.ssid = req.body.ssid;
    if (req.body.password !== undefined) existing.password = req.body.password;
    if (req.body.bssid !== undefined) existing.bssid = req.body.bssid;
    if (req.body.officeId !== undefined) existing.officeId = req.body.officeId;
    if (req.body.officeName !== undefined) existing.officeName = req.body.officeName;
    if (req.body.status !== undefined) {
      existing.status = req.body.status;
      existing.isActive = req.body.status === 'active';
    }

    await config.save();
    res.json({ success: true, message: 'Wi-Fi config updated.', data: config });
  } catch (error) {
    console.error('Error updating Wi-Fi config:', error);
    res.status(500).json({ success: false, message: 'Server error updating Wi-Fi config.' });
  }
};

/**
 * @desc    Delete Wi-Fi network config
 * @route   DELETE /api/attendance/smart/wifi-configs/:id
 */
export const deleteWifiConfig = async (req, res) => {
  try {
    const config = await SmartAttendanceConfig.findOne();
    if (!config) {
      return res.status(404).json({ success: false, message: 'Smart config not found.' });
    }

    const { id } = req.params;
    config.wifiNetworks = config.wifiNetworks.filter(
      (w) => w.wifiId !== id && w._id.toString() !== id && w.id !== id
    );

    await config.save();
    res.json({ success: true, message: 'Wi-Fi config deleted.', data: config });
  } catch (error) {
    console.error('Error deleting Wi-Fi config:', error);
    res.status(500).json({ success: false, message: 'Server error deleting Wi-Fi config.' });
  }
};
