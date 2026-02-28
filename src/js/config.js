/**
 * Centralized configuration for the Electricity Calculator app
 * Replaces scattered magic numbers throughout the code
 */

const CONFIG = {
    // ===== VALIDATION THRESHOLDS =====
    VALIDATION: {
        MIN_READING: 0,
        MAX_READING: 1000000,
        MIN_AMOUNT: 0,
        MAX_AMOUNT: 1000000,
        MIN_KWH: 0,
        MAX_KWH: 100000,
    },

    // ===== STORAGE LIMITS =====
    STORAGE: {
        MAX_FILE_SIZE: 5242880, // 5MB in bytes
        QUOTA_WARNING_THRESHOLD: 0.9, // Warn at 90% full
    },

    // ===== CSV SETTINGS =====
    CSV: {
        MAX_STRING_LENGTH: 1000,
        MIN_COLUMNS: 9,
        SEPARATOR: ',',
        BOM: '\uFEFF', // UTF-8 BOM for Excel
        FILENAME: 'electricity_data.csv',
    },

    // ===== CLOUD BACKUP SETTINGS =====
    CLOUD: {
        API_URL: 'https://jsonhosting.com/api/json',
        CORS_PROXY: 'https://corsproxy.io/?',
        FETCH_TIMEOUT: 10000, // 10 seconds in ms
        PREVIEW_MODAL_WIDTH: 'max-w-md',
    },

    // ===== UI TIMING =====
    UI: {
        ERROR_MODAL_SHOW_TIME: 5000, // 5 seconds
        SUCCESS_MODAL_AUTO_CLOSE_TIME: 5000, // 5 seconds
        TOAST_DURATION: 5000, // 5 seconds
        DEBOUNCE_DELAY: 300, // 300ms for input debouncing
    },

    // ===== UNDO SETTINGS =====
    UNDO: {
        MAX_HISTORY_SIZE: 10,
        EXPIRY_TIME: 10000, // 10 seconds before auto-dismiss undo toast
    },

    // ===== FORM SETTINGS =====
    FORM: {
        INITIAL_DATE: 'today', // Use today's date by default
    },

    // ===== LOCALE =====
    LOCALE: {
        LANGUAGE: 'he',
        DIRECTION: 'rtl',
        DATE_FORMAT: {
            options: { day: 'numeric', month: 'long', year: 'numeric' }
        },
    },

    // ===== ERROR MESSAGES =====
    MESSAGES: {
        // Validation
        NEGATIVE_CONSUMPTION: 'צריכה שלילית אינה אפשרית',
        REQUIRED_FIELD: 'שדה זה הוא חובה',
        INVALID_NUMBER: 'יש להזין מספר תקין',
        READING_MUST_INCREASE: 'קריאה חדשה חייבת להיות גדולה מהקריאה הקודמת',
        
        // Storage
        STORAGE_QUOTA_ERROR: 'הזיכרון של הדפדפן מלא. אנא מחקו חשבונות ישנים או נקו את סיכום הדפדפן.',
        
        // Cloud
        CLOUD_BACKUP_NOT_FOUND: 'גיבוי לא נמצא. בדוק את המזהה שלך.',
        CLOUD_BACKUP_ID_REQUIRED: 'יש להזין מזהה (ID) כדי לטעון נתונים.',
        CLOUD_LOAD_ERROR: 'שגיאה בטעינה:',
        CLOUD_NETWORK_ERROR: 'שגיאת רשת: לא ניתן להתחבר לשרת הגיבוי.',
        CLOUD_NETWORK_TIMEOUT: 'פג זמן ההמתנה. הרשת כנראה איטית.',
        CLOUD_LOAD_SUCCESS: 'הנתונים נטענו בהצלחה מהענן! ✓',
        CLOUD_SAVE_SUCCESS: 'הנתונים נשמרו בהצלחה לענן! ✓',
        CLOUD_INVALID_DATA: 'שגיאה בנתוני הגיבוי:',
        
        // CSV
        CSV_EMPTY_FILE: 'הקובץ ריק או לא תקין.',
        CSV_FILE_TOO_LARGE: 'הקובץ גדול מדי (מקסימום 5MB).',
        CSV_FILE_READ_ERROR: 'שגיאה בקריאת הקובץ:',
        CSV_IMPORT_COMPLETE: 'ייבוא הושלם:',
        CSV_ROWS_IMPORTED: 'חשבונות יובאו',
        CSV_ROWS_SKIPPED: 'שורות דולגו',
        
        // Bills
        DELETE_CONFIRM: 'האם את בטוחה שברצונך למחוק שורה זו?',
        DELETE_SUCCESS: 'חשבונית נמחקה',
        UNDO: 'בטל',
        BILL_NOT_FOUND: 'חשבונית לא נמצאה',
        BILL_CREATED_SUCCESS: 'חשבונית נשמרה בהצלחה',
        BILL_ADD_ERROR: 'שגיאה בשמירת חשבונית',
        CONFIRM_CLEAR_DATA: 'האם אתה בטוח שברצונך למחוק את כל הנתונים?',
        
        // General
        ERROR: 'שגיאה לא צפויה',
        SUCCESS: 'הצליח!',
        SAVE_SUCCESS: 'הגדרות נשמרו בהצלחה',
        OFFLINE: 'אינך מחובר לאינטרנט',
        STORAGE_QUOTA_EXCEEDED: 'הזיכרון של הדפדפן מלא. אנא מחקו חשבונות ישנים או נקו את נתוני הדפדפן.',
    },
};
