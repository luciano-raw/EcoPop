// Service to manage EcoPop Database (with LocalStorage fallback and structure for Supabase)

export interface EcoUser {
  id: string;
  name: string;
  email: string;
  points: number;
  clubId: string;
  recycledCount: number;
  co2Saved: number; // in kg
  waterSaved: number; // in liters
}

export interface QrCode {
  code: string;
  pointsValue: number;
  isActive: boolean;
}

export interface ClaimedCode {
  id: string;
  userId: string;
  code: string;
  claimedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'alimentos' | 'descuentos' | 'figuras';
  image: string;
}

export interface UserCoupon {
  id: string;
  userId: string;
  rewardId: string;
  couponCode: string;
  status: 'active' | 'used';
  claimedAt: string;
}

// Initial Mock Rewards
export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'rew-desc-40',
    title: '40% Descuento Entradas',
    description: 'Descuento del 40% en entradas tradicionales de lunes a jueves.',
    pointsCost: 200,
    category: 'descuentos',
    image: '🎟️'
  },
  {
    id: 'rew-fig-1',
    title: 'Figura Eco-Palomito',
    description: 'Figura coleccionable edición especial EcoPop hecha 100% de plástico reciclado.',
    pointsCost: 200,
    category: 'figuras',
    image: '🦖'
  },
  {
    id: 'rew-combo-med',
    title: 'Eco Combo Mediano',
    description: 'Palomitas medianas reciclables + bebida mediana en vaso biodegradable.',
    pointsCost: 150,
    category: 'alimentos',
    image: '🍿'
  },
  {
    id: 'rew-vaso-eco',
    title: 'Vaso Oficial EcoPop',
    description: 'Vaso coleccionable reutilizable con tecnología térmica y libre de BPA.',
    pointsCost: 150,
    category: 'figuras',
    image: '🥤'
  },
  {
    id: 'rew-vip-2x1',
    title: '2x1 Salas VIP Cinépolis',
    description: 'Dos entradas al precio de una para salas VIP Cinépolis cualquier día.',
    pointsCost: 300,
    category: 'descuentos',
    image: '🎬'
  },
  {
    id: 'rew-combo-grande',
    title: 'Eco Combo Grande',
    description: 'Palomitas grandes + 2 bebidas medianas en vasos biodegradables.',
    pointsCost: 300,
    category: 'alimentos',
    image: '✨'
  }
];

// Helper to generate a random Cinépolis Club Member ID
export const generateClubId = () => {
  return 'CP-' + Math.floor(100000 + Math.random() * 900000);
};

// Check if Supabase keys are configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = SUPABASE_URL.trim() !== '' && SUPABASE_ANON_KEY.trim() !== '';

// Database Service Implementation
class DbService {
  private isUsingSupabase: boolean = isSupabaseConfigured;

  constructor() {
    if (this.isUsingSupabase) {
      console.log('EcoPop: Conectado a Supabase Database.');
    } else {
      console.log('EcoPop: Utilizando LocalStorage Database de respaldo.');
      this.initLocalStorage();
    }
  }

  // Initialize localStorage keys if they don't exist
  private initLocalStorage() {
    if (!localStorage.getItem('ecopop_users')) {
      localStorage.setItem('ecopop_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('ecopop_qr_codes')) {
      // Preload 5 initial active codes for demo
      const initialQrs: QrCode[] = [
        { code: 'ECO-CUP-001', pointsValue: 100, isActive: true },
        { code: 'ECO-CUP-002', pointsValue: 100, isActive: true },
        { code: 'ECO-CUP-003', pointsValue: 100, isActive: true },
        { code: 'ECO-CUP-004', pointsValue: 100, isActive: true },
        { code: 'ECO-CUP-005', pointsValue: 100, isActive: true },
      ];
      localStorage.setItem('ecopop_qr_codes', JSON.stringify(initialQrs));
    }
    if (!localStorage.getItem('ecopop_claimed_codes')) {
      localStorage.setItem('ecopop_claimed_codes', JSON.stringify([]));
    }
    if (!localStorage.getItem('ecopop_user_coupons')) {
      localStorage.setItem('ecopop_user_coupons', JSON.stringify([]));
    }
  }

  // Get Current Active User from Session
  getCurrentUser(): EcoUser | null {
    const userStr = sessionStorage.getItem('ecopop_current_user');
    if (!userStr) return null;
    
    // Sync with localStorage DB to get updated points
    const user = JSON.parse(userStr) as EcoUser;
    const users = this.getLocalStorageItem<EcoUser>('ecopop_users');
    const dbUser = users.find(u => u.id === user.id);
    if (dbUser) {
      sessionStorage.setItem('ecopop_current_user', JSON.stringify(dbUser));
      return dbUser;
    }
    return user;
  }

  // Login or Register user
  loginOrRegister(name: string, email: string): EcoUser {
    const users = this.getLocalStorageItem<EcoUser>('ecopop_users');
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
        name,
        email,
        points: 0,
        clubId: generateClubId(),
        recycledCount: 0,
        co2Saved: 0,
        waterSaved: 0
      };
      users.push(user);
      this.setLocalStorageItem('ecopop_users', users);
    }

    sessionStorage.setItem('ecopop_current_user', JSON.stringify(user));
    return user;
  }

  // Logout
  logout() {
    sessionStorage.removeItem('ecopop_current_user');
  }

  // Get QR Code info
  getQrCode(code: string): QrCode | null {
    const qrs = this.getLocalStorageItem<QrCode>('ecopop_qr_codes');
    return qrs.find(q => q.code.toUpperCase() === code.toUpperCase()) || null;
  }

  // Register / Create new QR code (Admin function)
  createQrCode(code: string, pointsValue: number = 100): QrCode {
    const qrs = this.getLocalStorageItem<QrCode>('ecopop_qr_codes');
    const existing = qrs.find(q => q.code.toUpperCase() === code.toUpperCase());
    
    if (existing) {
      existing.isActive = true;
      existing.pointsValue = pointsValue;
      this.setLocalStorageItem('ecopop_qr_codes', qrs);
      return existing;
    }

    const newQr: QrCode = {
      code: code.toUpperCase(),
      pointsValue,
      isActive: true
    };
    qrs.push(newQr);
    this.setLocalStorageItem('ecopop_qr_codes', qrs);
    return newQr;
  }

  // List all QR codes (for Admin Panel)
  getAllQrCodes(): QrCode[] {
    return this.getLocalStorageItem<QrCode>('ecopop_qr_codes');
  }

  // Claim points from a QR Code scan
  claimQrCode(userId: string, codeStr: string): { success: boolean; message: string; pointsEarned?: number } {
    const qrs = this.getLocalStorageItem<QrCode>('ecopop_qr_codes');
    const qrIndex = qrs.findIndex(q => q.code.toUpperCase() === codeStr.toUpperCase());

    if (qrIndex === -1) {
      return { success: false, message: 'El código QR no es válido o no existe en el sistema.' };
    }

    const qr = qrs[qrIndex];
    if (!qr.isActive) {
      return { success: false, message: 'Este vaso ya ha sido reciclado y el código ya fue reclamado.' };
    }

    // Mark QR as claimed
    qr.isActive = false;
    this.setLocalStorageItem('ecopop_qr_codes', qrs);

    // Record the claim
    const claims = this.getLocalStorageItem<ClaimedCode>('ecopop_claimed_codes');
    const newClaim: ClaimedCode = {
      id: 'clm-' + Math.floor(10000 + Math.random() * 90000),
      userId,
      code: qr.code,
      claimedAt: new Date().toISOString()
    };
    claims.push(newClaim);
    this.setLocalStorageItem('ecopop_claimed_codes', claims);

    // Update User Stats
    const users = this.getLocalStorageItem<EcoUser>('ecopop_users');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const user = users[userIndex];
      user.points += qr.pointsValue;
      user.recycledCount += 1;
      user.co2Saved = parseFloat((user.recycledCount * 0.12).toFixed(2)); // 0.12kg of CO2 per cup
      user.waterSaved = parseFloat((user.recycledCount * 0.25).toFixed(2)); // 0.25l of water per cup
      
      this.setLocalStorageItem('ecopop_users', users);
      
      // Update session storage if it is the current user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        sessionStorage.setItem('ecopop_current_user', JSON.stringify(user));
      }
      
      return { success: true, message: '¡Código QR validado! Sumaste puntos.', pointsEarned: qr.pointsValue };
    }

    return { success: false, message: 'Usuario no encontrado.' };
  }

  // Get user coupons
  getUserCoupons(userId: string): (UserCoupon & { reward: Reward })[] {
    const userCoupons = this.getLocalStorageItem<UserCoupon>('ecopop_user_coupons');
    const rewards = INITIAL_REWARDS;

    const filtered = userCoupons.filter(uc => uc.userId === userId);
    
    return filtered.map(uc => {
      const reward = rewards.find(r => r.id === uc.rewardId)!;
      return { ...uc, reward };
    });
  }

  // Claim/Unlock a reward with points
  claimReward(userId: string, rewardId: string): { success: boolean; message: string; coupon?: UserCoupon } {
    const rewards = INITIAL_REWARDS;
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: 'Recompensa no encontrada.' };
    }

    // Check user points
    const users = this.getLocalStorageItem<EcoUser>('ecopop_users');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const user = users[userIndex];
    if (user.points < reward.pointsCost) {
      return { success: false, message: `Puntos insuficientes. Necesitas ${reward.pointsCost} puntos y tienes ${user.points}.` };
    }

    // Deduct points
    user.points -= reward.pointsCost;
    this.setLocalStorageItem('ecopop_users', users);

    // Create User Coupon
    const userCoupons = this.getLocalStorageItem<UserCoupon>('ecopop_user_coupons');
    const couponCode = 'ECO-' + reward.category.substring(0, 3).toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000);
    const newCoupon: UserCoupon = {
      id: 'ucp-' + Math.floor(10000 + Math.random() * 90000),
      userId,
      rewardId,
      couponCode,
      status: 'active',
      claimedAt: new Date().toISOString()
    };
    userCoupons.push(newCoupon);
    this.setLocalStorageItem('ecopop_user_coupons', userCoupons);

    // Update session storage if current user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      sessionStorage.setItem('ecopop_current_user', JSON.stringify(user));
    }

    return { success: true, message: `¡Canje exitoso! Se ha generado tu cupón.`, coupon: newCoupon };
  }

  // Use coupon (simulate checking out)
  useCoupon(couponId: string): boolean {
    const userCoupons = this.getLocalStorageItem<UserCoupon>('ecopop_user_coupons');
    const coupon = userCoupons.find(uc => uc.id === couponId);
    
    if (coupon && coupon.status === 'active') {
      coupon.status = 'used';
      this.setLocalStorageItem('ecopop_user_coupons', userCoupons);
      return true;
    }
    return false;
  }

  // Helper getters/setters for LocalStorage
  private getLocalStorageItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setLocalStorageItem<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const dbService = new DbService();
