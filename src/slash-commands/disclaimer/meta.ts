export const DISCLAIMER_VI =
  'Trong trường hợp nhóm này bị điều tra bởi các cơ quan trực thuộc bộ công an (hoặc các tổ chức chính trị tương tự), tôi khẳng định mình không liên quan tới nhóm hoặc những cá nhân khác trong nhóm này. Tôi không rõ tại sao mình lại có mặt ở đây, có lẽ tài khoản của tôi đã được thêm bởi một bên thứ ba. Tôi cũng xin khẳng định rằng mình không hề giúp sức cho những hành động của các thành viên trong nhóm này.' as const;

export const DISCLAIMER_EN =
  'In case of an investigation by any federal entity or similar, I do not have any involvement with this group or with the people in it. I do not know how I am here, probably added by a third party, and I do not support any actions by the members of this group.' as const;

export const FINANCIAL_DISCLAIMER_VI =
  'Thông tin được chia sẻ trong nhóm này chỉ mang tính chất giáo dục và thảo luận. Đây không phải là lời khuyên tài chính, đầu tư hoặc thuế. Mọi quyết định đầu tư đều có rủi ro và bạn có thể mất một phần hoặc toàn bộ số tiền đầu tư. Vui lòng tham khảo ý kiến của các chuyên gia tài chính có trình độ trước khi đưa ra bất kỳ quyết định đầu tư nào.' as const;

export const FINANCIAL_DISCLAIMER_EN =
  'Information shared in this group is for educational and discussion purposes only. This is not financial, investment, or tax advice. All investments carry risk and you may lose some or all of your invested capital. Please consult with qualified financial professionals before making any investment decisions.' as const;

export type DisclaimerMap = { en: string; vi: string };
export const DISCLAIMERS: Record<string, DisclaimerMap> = {
  general: {
    en: DISCLAIMER_EN,
    vi: DISCLAIMER_VI,
  },
  financial: {
    en: FINANCIAL_DISCLAIMER_EN,
    vi: FINANCIAL_DISCLAIMER_VI,
  },
} as const;
