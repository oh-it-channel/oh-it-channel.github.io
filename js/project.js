function switchTab(event, tabId) {
    // すべてのコンテンツを非表示
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // すべてのボタンのアクティブ状態を解除
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 選択されたコンテンツとボタンをアクティブ化
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// HTMLの読み込みが完了してから実行する設定
document.addEventListener('DOMContentLoaded', () => {
    const topGallerySwiper = new Swiper('.top-gallery-swiper', {
        loop: true,
        speed: 700,
        autoplay: {
            delay: 5000,
            disableOnInteraction: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});