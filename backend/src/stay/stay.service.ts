import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stay } from 'src/stay/stay.entity';
import { Repository } from 'typeorm';
import { SearchStayDto } from 'src/stay/dto/search-stay.dto';

@Injectable()
export class StayService {
  constructor(
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
  ) {}

  async search(query: SearchStayDto): Promise<Stay[]> {
    const queryBuilder =
      this.stayRepository.createQueryBuilder('stay');

    // Select all columns explicitly, using ST_AsText for point
    queryBuilder
      .select([
        'stay.id',
        'stay.name',
        'stay.address',
        'stay.rating',
        'stay.pricePerDay',
        'stay.maxGuests',
        'stay.imageUrl',
        'stay.host',
      ])
      .addSelect('ST_AsText(stay.point)', 'stay_point');

    if (query.numOfGuests !== undefined) {
      queryBuilder.andWhere('stay.maxGuests >= :numOfGuests', {
        numOfGuests: query.numOfGuests,
      });
    }

    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('stay.pricePerDay >= :minPrice', {
        minPrice: query.minPrice,
      });
    }

    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('stay.pricePerDay <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    // ST_GeomFromText로 사각형(Polygon) 생성하고, MBRContains로 포인트가 포함되는지 확인
    queryBuilder.andWhere(
      `MBRContains(
        ST_GeomFromText(:polygon),
        stay.point
      )`,
      {
        polygon: `POLYGON((
          ${query.swLng} ${query.swLat},
          ${query.neLng} ${query.swLat},
          ${query.neLng} ${query.neLat},
          ${query.swLng} ${query.neLat},
          ${query.swLng} ${query.swLat}
        ))`,
      },
    );

    queryBuilder
      .leftJoin('stay.host', 'host') // 👈 조인만 (데이터 안가져옴)
      .addSelect(['host.id', 'host.name']); // 👈 host 데이터 선택

    // getRawAndEntities를 사용하여 raw 결과와 엔티티를 모두 가져온다.
    const { entities, raw } = await queryBuilder.getRawAndEntities();

    // point_text(raw 결과의 좌표 문자열)을 엔티티의 point 필드로 매핑하는 작업
    entities.forEach((entity, index) => {
      // raw 데이터에서는 stay_point 키로 좌표 문자열이 저장되어 있다. (stay_가 프리픽스로 붙는다.)
      const rawRow = raw[index] as { stay_point?: string };
      const pointText = rawRow.stay_point;
      if (pointText) {
        const regex = /^POINT\(([-\d.]+) ([-\d.]+)\)$/;
        const match = pointText.match(regex);
        if (match) {
          entity.point = [Number(match[1]), Number(match[2])] as [
            number,
            number,
          ];
        }
      }
    });

    return entities;
  }

  async findByHostId(hostId: string): Promise<Stay[]> {
    return this.stayRepository.find({
      where: { host: { id: hostId } },
      relations: { host: true },
    });
  }

  async findById(id: number): Promise<Stay | null> {
    return this.stayRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    const stay = await this.stayRepository.findOne({
      where: { id },
    });
    if (!stay) {
      throw new NotFoundException('숙소를 찾을 수 없습니다.');
    }
    await this.stayRepository.delete(id);
  }
}
