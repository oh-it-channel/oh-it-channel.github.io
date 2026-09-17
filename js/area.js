document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const mapNavBtns = document.querySelectorAll('.map-nav-btn');
    const mapWrappers = document.querySelectorAll('.campus-map-wrapper');
    const buildingMarkers = document.querySelectorAll('.building-marker');
    const locationMarkers = document.querySelectorAll('.location-marker');
    const videoItems = document.querySelectorAll('.youtube-item');
    const mapAreas = document.querySelectorAll('map[name="building-1-areas"] area');
    const buildingMapAreas = document.querySelectorAll('map[name="campus-overview-areas"] area');
    const backBtn = document.querySelector('.back-btn');
    const campusOverviewMap = document.getElementById('campus-overview-map');
    const building1Map = document.getElementById('building-1-map');
    const building1MapImg = document.getElementById('building-1-map-img');
    
    // マップ切り替えボタンのクリックイベント（ボタンが存在する場合のみ）
    if (mapNavBtns.length > 0) {
        mapNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetMap = this.dataset.map;
                
                // すべてのボタンから active クラスを削除
                mapNavBtns.forEach(b => b.classList.remove('active'));
                
                // すべてのマップから active クラスを削除
                mapWrappers.forEach(wrapper => wrapper.classList.remove('active'));
                
                // クリックされたボタンに active クラスを追加
                this.classList.add('active');
                
                // 対応するマップに active クラスを追加
                if (targetMap === 'campus-overview') {
                    campusOverviewMap.classList.add('active');
                } else if (targetMap === 'building-1') {
                    building1Map.classList.add('active');
                }
            });
        });
    }
    
    // 建物マーカーのクリックイベント
    buildingMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const building = this.dataset.building;
            
            // 一号館マーカーがクリックされた場合、指さしアニメーションを停止
            if (building === 'building-1') {
                this.classList.add('clicked');
            }
            
            switchToBuilding(building);
        });
    });
    
    // DXフィールドのマーカーのクリックイベント（要素が存在する場合のみ）
    const dxfieldMarker = document.querySelector('.location-marker[data-location="dxfield"]');
    if (dxfieldMarker) {
        dxfieldMarker.addEventListener('click', function() {
            const location = 'dxfield';
            highlightLocation(location);
            scrollToVideo(location);
        });
    }
    
    // 建物マップエリアのクリックイベント
    buildingMapAreas.forEach(area => {
        area.addEventListener('click', function(e) {
            e.preventDefault();
            const building = this.dataset.building;
            
            // DXフィールドの場合は動画にスクロール
            if (building === 'dxfield') {
                const location = 'dxfield';
                highlightLocation(location);
                scrollToVideo(location);
                return;
            }
            
            switchToBuilding(building);
        });
    });
    
    // 戻るボタンのクリックイベント
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            switchToCampusOverview();
        });
    }
    
    // 場所マーカーのクリックイベント
    locationMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const location = this.dataset.location;
            highlightLocation(location);
            scrollToVideo(location);
        });
    });
    
    // 場所マップエリアのクリックイベント
    mapAreas.forEach(area => {
        area.addEventListener('click', function(e) {
            const location = this.dataset.location;
            highlightLocation(location);
            // スクロールはHTMLのanchorで行われるのでここでは不要
        });
    });
    
    // 動画アイテムにマウスオーバーした時のイベント
    videoItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const location = this.dataset.location;
            highlightMapMarker(location);
        });
        
        item.addEventListener('mouseleave', function() {
            resetMapMarkers();
        });
    });
    
    // キャンパス全体マップに切り替える関数
    function switchToCampusOverview() {
        // ナビゲーションボタンを更新（ボタンが存在する場合のみ）
        if (mapNavBtns.length > 0) {
            mapNavBtns.forEach(btn => {
                if (btn.dataset.map === 'campus-overview') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // マップの表示を切り替え
        if (campusOverviewMap) {
            campusOverviewMap.classList.add('active');
        }
        if (building1Map) {
            building1Map.classList.remove('active');
        }
        
        // 一号館マーカーの指さしアニメーションを再開
        const building1Marker = document.querySelector('.building-marker[data-building="building-1"]');
        if (building1Marker) {
            building1Marker.classList.remove('clicked');
        }
    }
    
    // 建物の詳細マップに切り替える関数
    function switchToBuilding(building) {
        if (building === 'building-1') {
            // ナビゲーションボタンを更新（ボタンが存在する場合のみ）
            if (mapNavBtns.length > 0) {
                mapNavBtns.forEach(btn => {
                    if (btn.dataset.map === 'building-1') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
            
            // マップの表示を切り替え
            if (campusOverviewMap) {
                campusOverviewMap.classList.remove('active');
            }
            if (building1Map) {
                building1Map.classList.add('active');
            }
            
            // マップエリアの座標を更新
            updateMapAreaCoords();
        }
    }
    
    // 画面サイズに合わせてマップエリアの座標を更新
    function updateMapAreaCoords() {
        if (!building1MapImg) return;
        
        const mapWidth = building1MapImg.clientWidth;
        const mapHeight = building1MapImg.clientHeight;
        
        mapAreas.forEach(area => {
            // 元のcoordsを取得
            const marker = document.querySelector(`.location-marker[data-location="${area.dataset.location}"]`);
            if (marker) {
                const x = parseInt(marker.dataset.x);
                const y = parseInt(marker.dataset.y);
                const radius = 20; // 円の半径は固定
                
                // マップのサイズに合わせて座標を計算
                const scaledX = Math.round(x * mapWidth / 800);
                const scaledY = Math.round(y * mapHeight / 400);
                const scaledRadius = Math.round(radius * mapWidth / 800);
                
                // 新しい座標をセット
                area.coords = `${scaledX},${scaledY},${scaledRadius}`;
            }
        });
    }
    
    // ウィンドウリサイズ時にマップエリアの座標を更新
    window.addEventListener('resize', updateMapAreaCoords);
    
    // 初期化時にも座標を更新
    updateMapAreaCoords();
    
    // 指定された場所を強調表示する関数
    function highlightLocation(location) {
        // すべてのマーカーとビデオのハイライトをリセット
        resetHighlights();
        
        // 対応するマーカーをハイライト
        highlightMapMarker(location);
        
        // 対応する動画をハイライト
        highlightVideo(location);
    }
    
    // マップマーカーをハイライトする関数
    function highlightMapMarker(location) {
        locationMarkers.forEach(marker => {
            if (marker.dataset.location === location) {
                marker.classList.add('active');
            }
        });
    }
    
    // 動画アイテムをハイライトする関数
    function highlightVideo(location) {
        videoItems.forEach(item => {
            if (item.dataset.location === location) {
                item.classList.add('highlight');
            }
        });
    }
    
    // すべてのハイライトをリセットする関数
    function resetHighlights() {
        resetMapMarkers();
        resetVideos();
    }
    
    // マップマーカーのハイライトをリセットする関数
    function resetMapMarkers() {
        locationMarkers.forEach(marker => {
            marker.classList.remove('active');
        });
    }
    
    // 動画アイテムのハイライトをリセットする関数
    function resetVideos() {
        videoItems.forEach(item => {
            item.classList.remove('highlight');
        });
    }
    
    // 指定された場所の動画までスクロールする関数
    function scrollToVideo(location) {
        videoItems.forEach(item => {
            if (item.dataset.location === location) {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    }
}); 

document.addEventListener('DOMContentLoaded', () => {
    // 施設ごとのデータ
    const locationData = {
        "one-karubi": {
            title: "ワンカルビ",
            description: "心ゆくまで焼肉を楽しめるテーブルオーダー式の食べ放題レストラン。<br>厳選された新鮮なお肉やこだわりのサイドメニューを、落ち着いた半個室の空間でゆっくり味わえます！<br><br>住所：<a href='https://maps.app.goo.gl/cXJ7g9Tcs8NxsT2r7' target='_blank' rel='noopener noreferrer'>〒573-0101 大阪府枚方市長尾峠町1-60</a>",
            images: ["./index_image/shop/1-one-karubi/1.jpg", "./index_image/shop/1-one-karubi/2.jpg"]
        },
        "kirinkaku": {
            title: "麒麟閣",
            description: "本格中華が味わえるお店。<br>お得なランチはもちろん、甘くてもっちりな名物「正式杏仁豆腐」はシメに絶対食べたいオススメの一品です！<br><br>住所：<a href='https://maps.app.goo.gl/ZRxhQhYp9V6NC9pd7' target='_blank' rel='noopener noreferrer'>〒573-0101 大阪府枚方市長尾峠町1-55</a>",
            images: ["./index_image/shop/2-kirin/1.png", "./index_image/shop/2-kirin/2.jpg", "./index_image/shop/2-kirin/3.jpg"]
        },
        "akamonya": {
            title: "赤門家",
            description: "濃厚スープと150円でおかわり自由なライスが魅力の家系ラーメン。豊富な卓上調味料で味変も自由自在です。<br>暑い時期には限定の冷やしラーメンも味わえます！<br><br>住所：<a href='https://maps.app.goo.gl/oaNtxyekfCnwSijk7' target='_blank' rel='noopener noreferrer'>〒573-0102 大阪府枚方市長尾家具町1丁目1番</a>",
            images: ["./index_image/shop/3-akamonya/1.JPG", "./index_image/shop/3-akamonya/2.JPG"]
        },
        "yuraku-sushi": {
            title: "有楽すし",
            description: "本格的なお寿司が味わえるお店。<br>お出汁の効いた煮物やお吸い物も美味しく、学生の財布に優しいお得なランチで楽しめます！<br><br>住所：<a href='https://maps.app.goo.gl/t7Qpr3Q2GEdZsLQR6' target='_blank' rel='noopener noreferrer'>〒573-0102 大阪府枚方市長尾家具町1丁目4-25</a>",
            images: ["./index_image/shop/4-sushi/1.jpg", "./index_image/shop/4-sushi/2.jpg", "./index_image/shop/4-sushi/3.jpg"]
        },
        "meuble": {
            title: "ムーブル",
            description: "美味しい料理が味わえる居心地抜群のカフェ。<br>品数豊富な日替わりランチはもちろん、朝7時開店なので一人暮らしの朝食にもぴったりです！<br><br>住所：<a href='https://maps.app.goo.gl/qAp23sFiP7zf4q1C9' target='_blank' rel='noopener noreferrer'>〒573-0102 大阪府枚方市長尾家具町1丁目5-4</a>",
            images: ["./index_image/shop/5-muble/1.png", "./index_image/shop/5-muble/2.png", "./index_image/shop/5-muble/3.png"]
        },
        "tada-seika": {
            title: "多田製菓",
            description: "本社併設の直売所で出来たての半生菓子が買える洋菓子店。<br>正規品はもちろん、お得な訳有り品や試作品など直売所ならではのラインナップが魅力です！<br><br>住所：<a href='https://maps.app.goo.gl/rfeuEZjCtBvADBhEA' target='_blank' rel='noopener noreferrer'>〒573-0102 大阪府枚方市長尾家具町2丁目12-10</a>",
            images: ["./index_image/shop/6-tada/1.jpg", "./index_image/shop/6-tada/2.jpg", "./index_image/shop/6-tada/3.jpg"]
        },
        "drugstore-cosmos": {
            title: "コスモス",
            description: "安さと品揃えが魅力のドラッグストア。<br>温めるだけの冷凍お弁当やラーメンなどが豊富に揃い、手軽に済ませたい毎日の食事に重宝しています！<br><br>住所：<a href='https://maps.app.goo.gl/8qK6UpcyUAzMy2Kz5' target='_blank' rel='noopener noreferrer'>〒573-0171 大阪府枚方市北山1丁目23-1</a>",
            images: ["./index_image/shop/7-cosmos/1.png", "./index_image/shop/7-cosmos/2.png", "./index_image/shop/7-cosmos/3.JPG"]
        },
        "yottette": {
            title: "よってって",
            description: "「新鮮・安心・安価」な農水産物が豊富に揃う直売所。<br>生産者直送の旬の野菜や果物、鮮魚まで幅広く並ぶ人気の市場です！<br><br>住所：<a href='https://maps.app.goo.gl/ycav86aDtXRpg9fa6' target='_blank' rel='noopener noreferrer'>〒573-0171 大阪府枚方市北山1丁目23-2</a>",
            images: ["./index_image/shop/8-yottette/1.png", "./index_image/shop/8-yottette/2.png", "./index_image/shop/8-yottette/3.png"]
        },
        "campus-OIT": {
            title: "大阪工業大学 枚方キャンパス",
            description: "",
            media: [
                    { type: "image", src: "./index_image/shop/9-OIT/1.jpg" },
                    // YouTubeの動画ID（URLの「v=XXXXX」の部分）を指定
                    { type: "youtube", id: "fgFFb0HRSOU" },
                    { type: "youtube", id: "zJSGQadtzNk" }
                ] 
        },
        "tosa-shokudo": {
            title: "土佐食堂",
            description: "昔ながらの温かい雰囲気が魅力の大衆食堂。<br>定食や丼ものなどメニューが豊富で、サクサク衣の魚フライをはじめ素朴で美味しい手作りの味が楽しめます！<br><br>住所：<a href='https://maps.app.goo.gl/SPg2VvxsqXbm6BkM7' target='_blank' rel='noopener noreferrer'>〒573-0102 大阪府枚方市長尾家具町2丁目17-6</a>",
            images: ["./index_image/shop/10-tosa/1.jpg", "./index_image/shop/10-tosa/2.jpg"]
        },
        "nitori-mall": {
            title: "ニトリモール 枚方店",
            description: "ニトリやヤマダ電機、くら寿司など多彩な店舗が並ぶ大型モール。<br>ファッション、生活用品から飲食店まで幅広く揃い、買い物もランチもまとめて楽しめます！<br><br>住所：<a href='https://maps.app.goo.gl/JmVprFZFvUsyGWnB6' target='_blank' rel='noopener noreferrer'>〒573-0171 大阪府枚方市北山1丁目2-1</a>",
            images: ["./index_image/shop/11-nitori/1.png", "./index_image/shop/11-nitori/ニトリモール内部.png", "./index_image/shop/11-nitori/ニトリモール内部2.png"]
        },

    };

    const markers = document.querySelectorAll('.location-marker');
    const modal = document.getElementById('location-modal');
    const modalMask = document.getElementById('location-modal-mask');
    const closeBtn = document.getElementById('modal-close-btn');
    const swiperWrapper = document.getElementById('modal-swiper-wrapper');
    const descriptionBox = document.getElementById('modal-description');
    let modalSwiper;

    markers.forEach(marker => {
        marker.addEventListener('click', function(e) {
            e.preventDefault();
            const locationKey = this.getAttribute('data-location');
            const data = locationData[locationKey];

            // データが登録されているマーカーをクリックした時だけ開く
            if (data) {
               // スライド（画像・動画）作成
                swiperWrapper.innerHTML = '';

                // media配列があれば使い、無ければ従来のimages配列を使う（過去の画像のみのスポットも動くようにする処理）
                const mediaList = data.media || (data.images ? data.images.map(src => ({ type: 'image', src })) : []);

                mediaList.forEach(item => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';

                    if (item.type === 'image') {
                        // 画像の場合
                        slide.innerHTML = `<img src="${item.src}" alt="${data.title}">`;
                    } else if (item.type === 'youtube') {
                        // YouTube動画の場合
                        slide.innerHTML = `
                            <iframe 
                                src="https://www.youtube-nocookie.com/embed/${item.id}" 
                                title="YouTube video player" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>`;
                    }
                    swiperWrapper.appendChild(slide);
                });

                // テキスト作成
                descriptionBox.innerHTML = `<h3>${data.title}</h3><p>${data.description}</p>`;

                // モーダル表示
                modal.classList.add('is-active');
                modalMask.classList.add('is-active');

                // Swiperリセット＆起動（自動スライド＆クリック対応）
                if (modalSwiper) modalSwiper.destroy(true, true);
                modalSwiper = new Swiper('.myLocationSwiper', {
                    loop: true, // ループ再生
                    autoplay: { delay: 3000, disableOnInteraction: false }, // 3秒で自動スライド
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, // 矢印クリック
                    pagination: { el: '.swiper-pagination', clickable: true }, // ドットクリック
                });
            }
        });
    });

    // 閉じる処理
    const closeModal = () => {
        modal.classList.remove('is-active');
        modalMask.classList.remove('is-active');
        if (pageBackContainer) {
            pageBackContainer.classList.remove('is-active');
        }
        if (modalSwiper) modalSwiper.autoplay.stop();

        // ▼ 追加：すべてのマーカーから水色状態（active）を解除する
        markers.forEach(marker => {
            marker.classList.remove('active');
        });

        // ▼ 追加：ボタンの選択状態（フォーカス）を強制的に解除する
        if (document.activeElement) {
            document.activeElement.blur();
        }
    };

    closeBtn.addEventListener('click', closeModal);
    modalMask.addEventListener('click', closeModal);
});