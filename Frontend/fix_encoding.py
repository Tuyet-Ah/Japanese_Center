from pathlib import Path

home = Path('Home.html')
text = home.read_text(encoding='latin-1')
# Normalize only the visible corrupted Vietnamese strings in Home.html
replacements = {
    'Trang chá»§': 'Trang chủ',
    'æW¥': '日',
    'Trung tÃ¢m giáº£ng dáº¡y tiáº¿ng Nháº­t': 'Trung tâm giảng dạy tiếng Nhật',
    'Æ¯u ÄQÃ£i há»Mc phÃ­, lá»Y trÃ¬nh rÃµ rÃ ng, há»W trá»£ táº­n tÃ¢m': 'Ưu đãi học phí, lộ trình rõ ràng, hỗ trợ tận tâm',
    'Há»Mc tiáº¿ng Nháº­t theo cÃ¡ch hiá»Gn ÄQáº¡i, trá»±c quan vÃ  dá»E theo dÃµi.': 'Học tiếng Nhật theo cách hiện đại, trực quan và dễ theo dõi.',
    'JSMART mang ÄQáº¿n khÃ³a há»Mc tá»« sÆ¡ cáº¥p ÄQáº¿n nÃ¢ng cao, tÃ i liá»Gu há»Mc táº­p ÄQÆ°á»£c chá»Mn lá»Mc vÃ  khu vá»±c cÃ¡ nhÃ¢n ÄQá»C báº¡n theo dÃµi tiáº¿n ÄQá»Y, há»Mc phÃ­ vÃ  ÄQÄCng kÃ½ lá»p nhanh hÆ¡n.': 'JSMART mang đến khóa học từ sơ cấp đến nâng cao, tài liệu học tập được chọn lọc và khu vực cá nhân để bạn theo dõi tiến độ, học phí và đăng ký lớp nhanh hơn.',
    'Xem khÃ³a há»Mc': 'Xem khóa học',
    'Báº¯t ÄQáº§u ngay': 'Bắt đầu ngay',
    'Æ¯u ÄQÃ£i thÃ¡ng nÃ y': 'Ưu đãi tháng này',
    'Giáº£m 20% cho khÃ³a N5 cÆ¡ báº£n': 'Giảm 20% cho khóa N5 cơ bản',
    'ÄCng kÃ½ trÆ°á»c ngÃ y 30 ÄQá»C nháº­n lá»Y trÃ¬nh há»Mc 8 tuáº§n, há»W trá»£ luyá»Gn pháº£n xáº¡ giao tiáº¿p vÃ  bá»Y ÄQá»A Ã´n táº­p riÃªng.': 'Đăng ký trước ngày 30 để nhận lộ trình học 8 tuần, hỗ trợ luyện phản xạ giao tiếp và bộ đề ôn tập riêng.',
    'há»Mc viÃªn ÄQÃ£ ÄQÄCng kÃ½': 'học viên đã đăng ký',
    'bÃ i há»Mc máº«u': 'bài học mẫu',
    'ÄQÃ¡nh giÃ¡ trung bÃ¬nh': 'đánh giá trung bình',
    'CÃ¡c Æ°u ÄQÃ£i ná»Ui báº­t': 'Các ưu đãi nổi bật',
    'Nhá»¯ng gÃ³i há»Mc ÄQÆ°á»£c chá»Mn lá»Mc ÄQá»C báº¡n báº¯t ÄQáº§u nhanh, há»Mc ÄQÃºng trÃ¬nh ÄQá»Y vÃ  tiáº¿t kiá»Gm chi phÃ­.': 'Những gói học được chọn lọc để bạn bắt đầu nhanh, học đúng trình độ và tiết kiệm chi phí.',
    'Combo N5 + tÃ i liá»Gu': 'Combo N5 + tài liệu',
    'Giáº£m giÃ¡ khi ÄQÄCng kÃ½ kÃ¨m bá»Y tÃ i liá»Gu luyá»Gn chá»¯, tá»« vá»±ng vÃ  bÃ i táº­p nghe.': 'Giảm giá khi đăng ký kèm bộ tài liệu luyện chữ, từ vựng và bài tập nghe.',
    'Chá»I tá»« 2.2 triá»Gu': 'Chỉ từ 2.2 triệu',
    'Xem giá»: 'Xem giỏ',
}
for a,b in replacements.items():
    text = text.replace(a,b)
home.write_text(text, encoding='utf-8')
print('Home.html repaired')
