import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employmentLength',
  standalone: true,
})
export class EmploymentLengthPipe implements PipeTransform {
  transform(
    startDate: string | Date | null | undefined,
    endDate: string | Date = new Date(),
    fallback = 'N/A',
  ): string {
    if (!startDate) {
      return fallback;
    }

    const start = startDate instanceof Date ? new Date(startDate) : new Date(startDate);
    const end = endDate instanceof Date ? new Date(endDate) : new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fallback;
    }

    if (start > end) {
      return '0y 0m 0d';
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years <= 0 && months <= 0 && days <= 0) {
      return '0 days';
    }

    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }

    if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }

    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
}
