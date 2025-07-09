import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import html2canvas from 'html2canvas';
import './App.css';

const App = () => {
 const [bgImageUrl, setBgImageUrl] = useState('/images/room.jpg');
 const [bgImage, bgImageStatus] = useImage(bgImageUrl, 'anonymous');
 const [imageError, setImageError] = useState(null);
 const plants = [
 {
 id: 'monstera',
 name: 'モンステラ',
 productName: 'ヴィンテージ・モンステラ（フェイク）',
 url: '/images/monstera.png',
 price: '3,980円 ',
 description: 'アンティークな部屋に映える、リアルな質感のフェイクモンステラ。手入れ不要で長く楽しめます。'
 },
 {
 id: 'dracaena',
 name: 'ドラセナ',
 productName: 'ヴィンテージ・ドラセナ（フェイク）',
 url: '/images/dracaena.png',
 price: '5,480円',
 description: 'エレガントな葉が特徴のフェイクドラセナ。ヴィンテージインテリアに洗練されたアクセントを。'
 },
 {
 id: 'pachira',
 name: 'パキラ',
 productName: 'ヴィンテージ・パキラ（フェイク）',
 url: '/images/pachira.png',
 price: '4,280円',
 description: '幸福を呼ぶと言われるフェイクパキラ。コンパクトでどんな部屋にもマッチします。'
 },
 ];
 const [selectedPlantUrl, setSelectedPlantUrl] = useState(plants[0].url);
 const [plantImage, plantImageStatus] = useImage(selectedPlantUrl, 'anonymous');
 const [plantImageError, setPlantImageError] = useState(null);
 const [plantPos, setPlantPos] = useState({ x: 400, y: 300 });
 const [scale, setScale] = useState(0.3);
 const stageRef = useRef(null);
 const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
 const [showPopup, setShowPopup] = useState(
 !sessionStorage.getItem('popupClosed') && !localStorage.getItem('dontShowPopup')
 );
 const [popupPage, setPopupPage] = useState(0);
 const [dontShowAgain, setDontShowAgain] = useState(false);
 const [page, setPage] = useState('home');
 const [menuOpen, setMenuOpen] = useState(false);
 const [gallery, setGallery] = useState(
 JSON.parse(localStorage.getItem('gallery')) || []
 );
 const [slideIndex, setSlideIndex] = useState(0);

 const slides = [
 '/images/room1.jpg',
 '/images/room2.jpg',
 '/images/room3.jpg',
 ];

 useEffect(() => {
 console.log('bgImageUrl:', bgImageUrl);
 console.log('bgImage:', bgImage);
 console.log('bgImageStatus:', bgImageStatus);
 if (bgImageStatus === 'failed') {
 setImageError('背景画像の読み込みに失敗しました。public/images/room.jpgを確認してください。');
 } else if (bgImage && bgImage.complete) {
 setImageError(null);
 const maxWidth = Math.max(320, Math.min(window.innerWidth - 40, 800));
 const aspectRatio = 4 / 3;
 const maxHeight = maxWidth / aspectRatio;
 const scale = Math.min(maxWidth / bgImage.width, maxHeight / bgImage.height);
 setStageSize({
 width: bgImage.width * scale,
 height: bgImage.height * scale,
 });
 console.log('Stage Size:', { width: bgImage.width * scale, height: bgImage.height * scale });
 } else {
 console.warn('背景画像がまだ読み込まれていません');
 }
 }, [bgImage, bgImageStatus]);

 useEffect(() => {
 console.log('selectedPlantUrl:', selectedPlantUrl);
 console.log('plantImage:', plantImage);
 console.log('plantImageStatus:', plantImageStatus);
 if (plantImageStatus === 'failed') {
 setPlantImageError(`観葉植物の画像（${selectedPlantUrl}）の読み込みに失敗しました。public/images/を確認してください。`);
 } else if (plantImage && plantImage.complete) {
 setPlantImageError(null);
 console.log('Plant Image Loaded:', plantImage);
 } else {
 console.warn('観葉植物の画像がまだ読み込まれていません');
 }
 }, [plantImage, plantImageStatus, selectedPlantUrl]);

 useEffect(() => {
 const updateSize = () => {
 if (bgImage && bgImage.complete) {
 const maxWidth = Math.max(320, Math.min(window.innerWidth - 40, 800));
 const aspectRatio = 4 / 3;
 const maxHeight = maxWidth / aspectRatio;
 const scale = Math.min(maxWidth / bgImage.width, maxHeight / bgImage.height);
 setStageSize({
 width: bgImage.width * scale,
 height: bgImage.height * scale,
 });
 console.log('Updated Stage Size:', { width: bgImage.width * scale, height: bgImage.height * scale });
 setPlantPos({ x: (bgImage.width * scale) / 2, y: (bgImage.height * scale) / 2 });
 }
 };
 updateSize();
 window.addEventListener('resize', updateSize);
 return () => window.removeEventListener('resize', updateSize);
 }, [bgImage]);

 useEffect(() => {
 const timer = setInterval(() => {
 setSlideIndex((prev) => (prev + 1) % slides.length);
 }, 5000);
 return () => clearInterval(timer);
 }, [slides.length]);

 const handleUpload = (e) => {
 const file = e.target.files[0];
 if (file) {
 if (!file.type.startsWith('image/')) {
 alert('画像ファイル（jpg、pngなど）を選択してください。');
 return;
 }
 if (file.size > 5 * 1024 * 1024) {
 alert('ファイルサイズは5MB以下にしてください。');
 return;
 }
 const url = URL.createObjectURL(file);
 console.log('アップロード画像URL:', url);
 setImageError(null);
 setBgImageUrl(url);
 }
 };

 const handlePlantSelect = (url) => {
 setSelectedPlantUrl(url);
 setPlantPos({ x: stageSize.width / 2, y: stageSize.height / 2 });
 };

 const handleSave = () => {
 const stage = stageRef.current;
 html2canvas(stage.container(), {
 backgroundColor: null,
 useCORS: true,
 width: stage.width(),
 height: stage.height(),
 }).then((canvas) => {
 const imageData = canvas.toDataURL('image/jpeg', 0.9);
 const newGallery = [
 ...gallery,
 { id: Date.now(), image: imageData, username: 'ゲスト', likes: 0, comments: [] },
 ];
 setGallery(newGallery);
 localStorage.setItem('gallery', JSON.stringify(newGallery));
 const link = document.createElement('a');
 link.download = 'インテリア画像.jpg';
 link.href = imageData;
 link.click();
 });
 };

 const handleClosePopup = () => {
 setShowPopup(false);
 sessionStorage.setItem('popupClosed', 'true');
 if (dontShowAgain) localStorage.setItem('dontShowPopup', 'true');
 };

 const handleNextPage = () => {
 if (popupPage < 4) setPopupPage(p => p + 1);
 };

 const handlePrevPage = () => {
 if (popupPage > 0) setPopupPage(p => p - 1);
 };

 const handleResetPopup = () => {
 localStorage.removeItem('dontShowPopup');
 sessionStorage.removeItem('popupClosed');
 setShowPopup(true);
 setPopupPage(0);
 setPage('home');
 };

 const handleLike = (id) => {
 const newGallery = gallery.map((item) =>
 item.id === id ? { ...item, likes: item.likes + 1 } : item
 );
 setGallery(newGallery);
 localStorage.setItem('gallery', JSON.stringify(newGallery));
 };

 const handleComment = (id, comment) => {
 const newGallery = gallery.map((item) =>
 item.id === id ? { ...item, comments: [...item.comments, comment] } : item
 );
 setGallery(newGallery);
 localStorage.setItem('gallery', JSON.stringify(newGallery));
 };

 const handleAddToCart = (productName) => {
 alert(`${productName}をカートに追加しました！`);
 };

 const handleScaleChange = (newScale) => {
 setScale(Math.max(0.1, Math.min(1, newScale)));
 };

 const renderHomePage = () => (
 <div className="slideshow-container">
 <div className="slideshow">
  <div className="slideshow-title">Greenatelier</div>
 <img
 src={slides[slideIndex]}
 alt={`部屋 ${slideIndex + 1}`}
 className="slideshow-image"
 style={{ opacity: slideIndex === slideIndex ? 1 : 0 }}
 />
 <div className="slideshow-overlay" />
 <img
  src="/images/logo.png"
  alt="ロゴ"
  className="logo-image"
/>

 <p className="slideshow-subtitle">観葉植物シュミレーター</p>
 <button
 className="start-button"
 onClick={() => setPage('main')}
 >
 デザインを始める
 </button>
 </div>
 </div>
 );

 const renderMainPage = () => (
 <div className="main-page-container">
 {imageError && <p className="error-message">{imageError}</p>}
 {plantImageError && <p className="error-message">{plantImageError}</p>}
 <div className="canvas-container">
 <Stage
 width={stageSize.width}
 height={stageSize.height}
 ref={stageRef}
 className="canvas"
 style={{ touchAction: 'none' }} // キャンバス内はタッチ操作を制限
 >
 <Layer>
 {bgImage && (
 <KonvaImage
 image={bgImage}
 x={0}
 y={0}
 width={stageSize.width}
 height={stageSize.height}
 listening={false}
 />
 )}
 {plantImage && (
 <KonvaImage
 image={plantImage}
 x={plantPos.x}
 y={plantPos.y}
 scaleX={scale}
 scaleY={scale}
 draggable
 onDragMove={(e) => {
 const stage = stageRef.current;
 const plantWidth = plantImage ? plantImage.width * scale : 0;
 const plantHeight = plantImage ? plantImage.height * scale : 0;
 const newX = Math.max(0, Math.min(e.target.x(), stage.width() - plantWidth));
 const newY = Math.max(0, Math.min(e.target.y(), stage.height() - plantHeight));
 e.target.x(newX);
 e.target.y(newY);
 setPlantPos({ x: newX, y: newY });
 }}
 />
 )}
 </Layer>
 </Stage>
 <div className="scale-controls">
 <button
 className="scale-button"
 onClick={() => handleScaleChange(scale - 0.1)}
 >
 −
 </button>
 <input
 type="range"
 min="0.1"
 max="1"
 step="0.01"
 value={scale}
 onChange={(e) => setScale(Number(e.target.value))}
 className="scale-slider"
 />
 <button
 className="scale-button"
 onClick={() => handleScaleChange(scale + 0.1)}
 >
 ＋
 </button>
 <span className="scale-value">サイズ: {(scale * 100).toFixed(0)}%</span>
 </div>
 </div>
 <p className="recommended-ratio">推奨画像比率: 4:3（例: 800x600px）</p>
 <button
 className="guide-button"
 onClick={() => setPage('guide')}
 >
 📖 使い方
 </button>
 <input
 type="file"
 accept="image/*"
 onChange={handleUpload}
 className="file-input"
 />
 <div className="plant-selection">
 {plants.map((plant) => (
 <div key={plant.id} className="plant-card">
 <img
 src={plant.url}
 alt={plant.name}
 className={`plant-thumbnail ${selectedPlantUrl === plant.url ? 'selected' : ''}`}
 onClick={() => handlePlantSelect(plant.url)}
 />
 <span className="plant-name">{plant.name}</span>
 <button
 className="buy-button"
 onClick={() => setPage(`product-${plant.id}`)}
 >
 🛒 購入する
 </button>
 </div>
 ))}
 </div>
 <button onClick={handleSave} className="save-button">
 画像を保存
 </button>
 </div>
 );

 const renderGuidePage = () => (
 <>
 <h1>グリーンアトリエの使い方</h1>
 <p>このアプリで、植物を使ったお部屋のインテリアをデザインできます！</p>
 <ul>
 <li><strong>写真をアップロード</strong>：お部屋の画像を選んで背景に設定。</li>
 <li><strong>植物を選ぶ</strong>：モンステラ、ドラセナ、パキラをサムネイルで選択。</li>
 <li><strong>配置とサイズ調整</strong>：植物をドラッグして移動、キャンバス上のスライダーや＋−ボタンで大きさを変更（10～100%）。</li>
 <li><strong>購入する</strong>：「購入する」ボタンでフェイクグリーンの商品ページへ。</li>
 <li><strong>保存</strong>：「画像を保存」を押して、インテリアをJPEGでダウンロード。</li>
 </ul>
 <button
 className="back-button"
 onClick={() => setPage('home')}
 >
 戻る
 </button>
 <button
 className="reset-popup-button"
 onClick={handleResetPopup}
 >
 初回ポップアップを再表示
 </button>
 </>
 );

 const renderPopupContent = () => {
 switch (popupPage) {
 case 0:
 return (
 <>
 <h2>ステップ1: 写真をアップロード</h2>
 <p>お部屋の画像をアップロードして背景に設定します。推奨比率は4:3（例: 800x600px）です。</p>
 </>
 );
 case 1:
 return (
 <>
 <h2>ステップ2: 植物を選ぶ</h2>
 <p>モンステラ、ドラセナ、パキラをサムネイルから選択します。</p>
 </>
 );
 case 2:
 return (
 <>
 <h2>ステップ3: 配置とサイズ調整</h2>
 <p>植物をドラッグして移動、キャンバス上のスライダーや＋−ボタンで大きさを調整（10～100%）。</p>
 </>
 );
 case 3:
 return (
 <>
 <h2>ステップ4: 購入する</h2>
 <p>「購入する」ボタンでフェイクグリーンの商品ページへ移動します。</p>
 </>
 );
 case 4:
 return (
 <>
 <h2>ステップ5: 保存</h2>
 <p>「画像を保存」を押して、デザインしたインテリアをJPEGでダウンロードします。</p>
 <label className="popup-checkbox">
 <input
 type="checkbox"
 checked={dontShowAgain}
 onChange={(e) => setDontShowAgain(e.target.checked)}
 />
 今後は表示しない
 </label>
 </>
 );
 default:
 return null;
 }
 };

 const renderGalleryPage = () => (
 <>
 <h1>みんなのグリーンアトリエ</h1>
 <div className="gallery-grid">
 {gallery.length > 0 ? (
 gallery.map((item) => (
 <div key={item.id} className="gallery-card">
 <img src={item.image} alt="インテリア" className="gallery-image" />
 <p className="gallery-username">by {item.username}</p>
 <div className="gallery-actions">
 <button
 className="like-button"
 onClick={() => handleLike(item.id)}
 >
 ❤️ {item.likes}
 </button>
 <div className="comment-section">
 {item.comments.map((comment, index) => (
 <p key={index} className="gallery-comment">{comment}</p>
 ))}
 <input
 type="text"
 placeholder="コメントを追加..."
 className="comment-input"
 onKeyPress={(e) => {
 if (e.key === 'Enter' && e.target.value.trim()) {
 handleComment(item.id, e.target.value);
 e.target.value = '';
 }
 }}
 />
 </div>
 </div>
 </div>
 ))
 ) : (
 <p>まだインテリアがありません。デザインを保存してシェアしましょう！</p>
 )}
 </div>
 <button
 className="back-button"
 onClick={() => setPage('home')}
 >
 戻る
 </button>
 </>
 );

 const renderProductPage = (plantId) => {
 const plant = plants.find((p) => p.id === plantId);
 if (!plant) return <p>商品が見つかりません</p>;
 return (
 <>
 <h1>{plant.productName}</h1>
 <img src={plant.url} alt={plant.productName} className="product-image" />
 <p className="product-price">{plant.price}</p>
 <p className="product-description">{plant.description}</p>
 <button
 className="add-to-cart-button"
 onClick={() => handleAddToCart(plant.productName)}
 >
 カートに追加
 </button>
 <button
 className="back-button"
 onClick={() => setPage('home')}
 >
 戻る
 </button>
 </>
 );
 };

 const renderProductsPage = () => (
 <>
 <h1>商品一覧</h1>
 <div className="products-grid">
 {plants.map((plant) => (
 <div key={plant.id} className="product-card">
 <img src={plant.url} alt={plant.productName} className="product-card-image" />
 <p className="product-card-name">{plant.productName}</p>
 <p className="product-card-price">{plant.price}</p>
 <button
 className="buy-button"
 onClick={() => setPage(`product-${plant.id}`)}
 >
 🛒 購入する
 </button>
 </div>
 ))}
 </div>
 <button
 className="back-button"
 onClick={() => setPage('home')}
 >
 戻る
 </button>
 </>
 );

 const renderMenu = () => (
 <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
 <div className="menu">
 <button
 className="menu-close-button"
 onClick={() => setMenuOpen(false)}
 >
 ✖
 </button>
 <h2>メニュー</h2>
 <button
 className="menu-item"
 onClick={() => { setPage('home'); setMenuOpen(false); }}
 >
 ホーム
 </button>
 <button
 className="menu-item"
 onClick={() => { setPage('main'); setMenuOpen(false); }}
 >
 デザイン
 </button>
 <button
 className="menu-item"
 onClick={() => { setPage('guide'); setMenuOpen(false); }}
 >
 使い方
 </button>
 <button
 className="menu-item"
 onClick={() => { setPage('gallery'); setMenuOpen(false); }}
 >
 ギャラリー
 </button>
 <button
 className="menu-item"
 onClick={() => { setPage('products'); setMenuOpen(false); }}
 >
 商品一覧
 </button>
 </div>
 </div>
 );

 return (
 <div className="app-container">
 <button
 className="menu-button"
 onClick={() => setMenuOpen(true)}
 >
 ☰
 </button>
 {showPopup && (page === 'home' || page === 'main') && (
 <div className="popup-overlay">
 <div className="popup">
 {renderPopupContent()}
 <div className="popup-navigation">
 {popupPage > 0 && (
 <button
 className="popup-prev-button"
 onClick={handlePrevPage}
 >
 前へ
 </button>
 )}
 {popupPage < 4 && (
 <button
 className="popup-next-button"
 onClick={handleNextPage}
 >
 次へ
 </button>
 )}
 </div>
 <button
 className="popup-close-button"
 onClick={handleClosePopup}
 >
 閉じる
 </button>
 </div>
 </div>
 )}
 {page === 'home' && renderHomePage()}
 {page === 'main' && renderMainPage()}
 {page === 'guide' && renderGuidePage()}
 {page === 'gallery' && renderGalleryPage()}
 {page === 'products' && renderProductsPage()}
 {page.startsWith('product-') && renderProductPage(page.replace('product-', ''))}
 {renderMenu()}
 <p className="credit">実学実習１ 権藤巧海</p>
 </div>
 );
};
<div className="slideshow">
  <div className="slideshow-overlay"></div>
  <h1 className="slideshow-title">Greenatelier</h1>
  {/* 他の要素もここに書く */}
</div>

export default App;