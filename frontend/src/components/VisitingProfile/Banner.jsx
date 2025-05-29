const Banner = ({ bannerImage }) => (
  <div className="aspect-[3/1] relative bg-gray-800">
    <img
      src={bannerImage}
      alt="Banner"
      className="w-full h-full object-cover"
    />
  </div>
);

export default Banner;
