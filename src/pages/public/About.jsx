const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-light mb-4 text-center" style={{ color: 'rgb(var(--color-text-primary))' }}>
            О бренде <span className="font-serif italic text-primary">Sadia.lux</span>
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-12 space-y-6">
            <p className="text-lg leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Sadia.lux — это бренд одежды, созданный специально для современных мусульманок, 
              которые ценят стиль, качество и соблюдают принципы скромности. Наша история 
              началась с желания создать пространство, где каждая женщина может найти элегантную 
              и соответствующую исламским нормам одежду.
            </p>
            
            <h2 className="text-3xl font-light mt-8 mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Наша миссия</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Мы стремимся помочь каждой женщине выразить свою индивидуальность через элегантную 
              и современную одежду, которая соответствует принципам скромности. Мы верим, что 
              стиль и скромность могут прекрасно сочетаться, создавая неповторимый образ уверенной 
              в себе женщины.
            </p>

            <h2 className="text-3xl font-light text-gray-800 mt-8 mb-4">Наши ценности</h2>
            <ul className="text-lg leading-relaxed space-y-3 list-disc list-inside" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              <li><strong>Качество:</strong> Мы тщательно отбираем ткани и следим за каждым этапом производства</li>
              <li><strong>Скромность:</strong> Все наши модели соответствуют исламским нормам</li>
              <li><strong>Стиль:</strong> Мы создаем современные коллекции, следуя актуальным трендам</li>
              <li><strong>Индивидуальность:</strong> Каждая женщина уникальна, и мы помогаем ей найти свой стиль</li>
            </ul>

            <h2 className="text-3xl font-light text-gray-800 mt-8 mb-4">Наш процесс</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Мы сотрудничаем с проверенными производителями, используем только качественные материалы 
              и уделяем внимание каждой детали. Наша команда работает над тем, чтобы каждая вещь 
              из коллекции Sadia.lux радовала наших покупательниц долгие годы.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-xl font-light" style={{ color: 'rgb(var(--color-text-primary))' }}>
                Благодарим вас за выбор Sadia.lux. Мы рады быть частью вашего стиля!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

