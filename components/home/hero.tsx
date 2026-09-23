export function HeroSection() {
  return (
    <section
      className="relative flex min-h-[55vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:min-h-[60vh]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/70">
        Study · Share · Grow
      </p>
      <h1 className="max-w-3xl text-4xl font-medium leading-tight text-[var(--color-whiteout)] sm:text-5xl md:text-6xl">
        함께 배우는{" "}
        <span className="font-[family-name:var(--font-cursive)] text-5xl italic text-[var(--color-twilight)] sm:text-6xl md:text-7xl">
          rabbit
        </span>{" "}
        커뮤니티
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
        Air 스타일의 다크 UI로 스터디와 Q&amp;A를 나눠 보세요. <br/> 로그인 후 글을 작성할 수
        있습니다.
      </p>
    </section>
  );
}
