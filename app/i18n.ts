export type Lang = 'ar';

export const translations = {
  ar: {
    title: 'إلى مروان حافظ القراَن',
    subtitle: 'اكتب له كلمة و ازرع له دعوة , فلعلها ترافقه طول العمر',
    nameLabel: 'اسمك',
    namePlaceholder: 'مثال: سارة أحمد',
    messageLabel: 'رسالتك',
    messagePlaceholder: '',
    submit: 'إرسال',
    submitting: 'جاري الإرسال…',
    thankYouTitle: 'تم استلام رسالتك',
    thankYouBody: 'شكرًا لكلماتك الطيبة، ستُحفظ بعناية.',
    alreadySignedTitle: 'لقد ارسلت من قبل',
    alreadySignedBody: 'يبدو أنك ارسلت في دفتر الضيوف من قبل على هذا الجهاز. شكرًا لك مرة أخرى!',
    errorGeneric: 'حدث خطأ ما. حاول مرة أخرى.',
    errorRequired: 'يرجى تعبئة الحقلين.',
  },
} as const;
